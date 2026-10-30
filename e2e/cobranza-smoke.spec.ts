import {
  expect,
  request as playwrightRequest,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const API_URL = (process.env.E2E_API_URL ?? "").replace(/\/$/, "");
const EMAIL = process.env.E2E_USER_EMAIL;
const PASSWORD = process.env.E2E_USER_PASSWORD;
const ALLOW_WRITES = process.env.E2E_ALLOW_WRITES === "true";
const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const BUSINESS_CODE = "egg";
const COBRANZA_PATH = "/business/huevo/accounting?mode=COBRANZA";
const WRITE_AMOUNT = 0.01;

if (!API_URL || !EMAIL || !PASSWORD) {
  throw new Error(
    "Faltan E2E_API_URL, E2E_USER_EMAIL o E2E_USER_PASSWORD en .env.e2e.local",
  );
}

if (new URL(APP_URL).host === "ocosur.netlify.app") {
  throw new Error("La prueba de humo no puede ejecutarse contra producción");
}

interface CedisBalance {
  creditorId: number;
  creditorName: string;
  balance: number;
}

interface TripClient {
  clientId: number | null;
  clientName: string;
  accountingEntityId: number | null;
  saleTotal: number;
  saldoTotal: number;
  cedisBalances: CedisBalance[];
}

interface TripCollection {
  tripId: number;
  departureDate: string;
  driverId: number;
  driverName: string | null;
  routeId: number;
  routeName: string | null;
  vehicleName: string | null;
  cashOnlyTotal: number;
  clients: TripClient[];
}

interface ClientLite {
  id: number;
  name?: string | null;
  businessName?: string | null;
  accountingEntityId?: number | null;
}

interface PaymentResponse {
  id: number;
  amount: number;
  status: "ACTIVE" | "CANCELLED";
  tripId?: number;
}

interface CashFlowMovement {
  id: number;
  sourceType: string | null;
  sourceId: number | null;
}

interface Availability {
  writable: boolean;
  reason: string;
  message: string | null;
}

interface OpenAccount {
  balance: number;
}

interface AuthState {
  token: string;
  user: Record<string, unknown>;
}

interface SmokeData {
  client: TripClient;
  trip: TripCollection;
  tripDate: string;
  clientAvailability: Availability;
  tripAvailability: Availability;
}

const createdPaymentIds = new Set<number>();

let api: APIRequestContext;
let auth: AuthState;
let data: SmokeData;

const pad = (value: number) => String(value).padStart(2, "0");

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const authHeaders = () => ({
  Authorization: `Bearer ${auth.token}`,
  "X-Business-Code": BUSINESS_CODE,
});

async function getJson<T>(path: string): Promise<T> {
  const response = await api.get(path, { headers: authHeaders() });
  if (!response.ok()) {
    throw new Error(
      `${path} respondió ${response.status()}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

async function getAvailability(date: string): Promise<Availability> {
  return getJson<Availability>(
    `/api/v1/egg-cash-flow/collections/availability?date=${date}`,
  );
}

async function getOpenDebt(payerId: number): Promise<number> {
  const params = new URLSearchParams({
    debtorId: String(payerId),
    creditorEntityType: "EGGCEDIS",
    status: "OPEN",
  });
  const accounts = await getJson<OpenAccount[]>(
    `/api/read/accounts-payable/open?${params.toString()}`,
  );
  return accounts.reduce((sum, account) => sum + Number(account.balance), 0);
}

async function getPayment(paymentId: number): Promise<PaymentResponse | null> {
  const payments = await getJson<PaymentResponse[]>(
    "/api/accounting/payments/recent?limit=100",
  );
  return payments.find((payment) => payment.id === paymentId) ?? null;
}

async function getCashFlowMovement(
  paymentId: number,
  date: string,
): Promise<CashFlowMovement | null> {
  const movements = await getJson<CashFlowMovement[]>(
    `/api/v1/egg-cash-flow/movements?from=${date}&to=${date}`,
  );
  return (
    movements.find(
      (movement) =>
        movement.sourceType === "PAYMENT" &&
        Number(movement.sourceId) === paymentId,
    ) ?? null
  );
}

async function cancelPayment(paymentId: number): Promise<void> {
  const response = await api.post(
    `/api/accounting/payments/${paymentId}/cancel`,
    { headers: authHeaders() },
  );
  if (!response.ok()) {
    throw new Error(
      `No se pudo cancelar el pago ${paymentId}: ${response.status()} ${await response.text()}`,
    );
  }
  createdPaymentIds.delete(paymentId);
}

async function discoverSmokeData(): Promise<SmokeData> {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 60);

  const [trips, clients] = await Promise.all([
    getJson<TripCollection[]>(
      `/api/read/accounts-payable/collections/trips?from=${toIsoDate(from)}&to=${toIsoDate(today)}`,
    ),
    getJson<ClientLite[]>("/api/v1/clients"),
  ]);

  const knownEntityIds = new Set(
    clients
      .map((client) => client.accountingEntityId)
      .filter((id): id is number => id != null),
  );
  const todayIso = toIsoDate(today);
  const sameMonth = todayIso.slice(0, 7);
  const creditTrips = trips
    .filter((trip) => trip.departureDate.slice(0, 7) === sameMonth)
    .filter((trip) =>
      trip.clients.some(
        (client) =>
          client.accountingEntityId != null &&
          knownEntityIds.has(client.accountingEntityId) &&
          client.saldoTotal > 0 &&
          client.cedisBalances.length > 0,
      ),
    )
    .sort(
      (left, right) =>
        right.departureDate.localeCompare(left.departureDate) ||
        right.clients.length - left.clients.length,
    );

  const trip = creditTrips[0];
  if (!trip) {
    throw new Error(
      "No hay un despacho del mes actual con un cliente de crédito con deuda y CEDIS",
    );
  }

  const client = trip.clients.find(
    (candidate) =>
      candidate.accountingEntityId != null &&
      knownEntityIds.has(candidate.accountingEntityId) &&
      candidate.saldoTotal > 0 &&
      candidate.cedisBalances.length > 0,
  );

  if (!client || client.accountingEntityId == null) {
    throw new Error(
      "No se encontró un cliente de crédito válido para la prueba",
    );
  }

  const [clientAvailability, tripAvailability] = await Promise.all([
    getAvailability(todayIso),
    getAvailability(trip.departureDate),
  ]);

  return {
    client,
    trip,
    tripDate: trip.departureDate,
    clientAvailability,
    tripAvailability,
  };
}

const RELEVANT_ERROR_PATHS = [
  "/api/read/accounts-payable/collections/trips",
  "/api/v1/egg-cash-flow/collections/availability",
  "/api/accounting/payments/same-day",
  "/api/accounting/payments/fifo",
  "/api/accounting/payments/bulk-fifo",
  "/api/v1/clients",
];

const isRelevantError = (url: string) =>
  RELEVANT_ERROR_PATHS.some((path) => url.includes(path)) ||
  (url.includes("/api/read/accounts-payable/open") &&
    url.includes("debtorId="));

async function openCobranza(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().startsWith("Failed to load resource")
    ) {
      errors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      if (isRelevantError(response.url())) {
        errors.push(`${response.status()} ${response.url()}`);
      } else {
        console.warn(
          `[cobranza-smoke] error transitorio en consulta secundaria: ${response.status()} ${response.url()}`,
        );
      }
    }
  });

  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { token: auth.token, user: auth.user },
  );
  await page.goto(COBRANZA_PATH);
  await expect(
    page.getByRole("tablist", { name: "Modo de cobranza" }),
  ).toBeVisible({ timeout: 20_000 });
  return errors;
}

async function selectCollector(page: Page): Promise<void> {
  const select = page.locator("#cobranza-collector");
  if ((await select.count()) === 0) return;
  const firstDriver = await select
    .locator("option")
    .nth(1)
    .getAttribute("value");
  if (firstDriver) {
    await select.selectOption(firstDriver);
  }
}

async function selectClient(page: Page, clientName: string): Promise<void> {
  const search = page.getByLabel("Buscar cliente");
  await search.fill(clientName);
  const option = page
    .getByRole("option")
    .filter({ hasText: clientName })
    .first();
  await expect(option).toBeVisible({ timeout: 20_000 });
  await option.click();
  await expect(page.getByText("Deuda total")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator("#collection-amount")).not.toHaveValue("");
}

async function setTripDate(page: Page, tripDate: string): Promise<void> {
  const target = new Date(`${tripDate}T00:00:00`);
  const today = new Date();
  expect(tripDate.slice(0, 7)).toBe(toIsoDate(today).slice(0, 7));

  const firstOfMonth = new Date(target.getFullYear(), target.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  const index = Math.floor(
    (target.getTime() - gridStart.getTime()) / (24 * 60 * 60 * 1000),
  );

  await page.locator("#trip-collection-date").click();
  const dayButtons = page.getByRole("button", { name: /^\d{1,2}$/ });
  await expect(dayButtons).toHaveCount(42);
  await dayButtons.nth(index).click();
}

async function expandTrip(page: Page, trip: TripCollection): Promise<void> {
  const tripButton = page
    .getByRole("button")
    .filter({ hasText: `Chofer: ${trip.driverName ?? "—"}` })
    .filter({ hasText: `Ruta: ${trip.routeName ?? "—"}` })
    .first();
  await expect(tripButton).toBeVisible({ timeout: 20_000 });
  await tripButton.click();
}

const assertNoMojibake = async (page: Page) => {
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/Ã|Â|â€|â†|�/);
};

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.describe("@cobranza", () => {
  test.beforeAll(async () => {
    api = await playwrightRequest.newContext({ baseURL: API_URL });
    const response = await api.post("/auth/login", {
      data: { email: EMAIL, password: PASSWORD },
    });
    expect(
      response.ok(),
      `Login falló con estado ${response.status()}`,
    ).toBeTruthy();
    auth = (await response.json()) as AuthState;
    expect(
      (auth.user.allowedBusinesses as string[] | undefined) ?? [],
      "El usuario no tiene acceso a Huevo",
    ).toContain("EGG");
    data = await discoverSmokeData();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.afterEach(async () => {
    const failures: string[] = [];
    for (const paymentId of Array.from(createdPaymentIds)) {
      try {
        await cancelPayment(paymentId);
      } catch (error) {
        failures.push(
          `pago ${paymentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    if (failures.length > 0) {
      throw new Error(`Limpieza incompleta: ${failures.join("; ")}`);
    }
  });

  test("cliente muestra deuda, CEDIS y avisos del día", async ({ page }) => {
    const errors = await openCobranza(page);
    await selectCollector(page);

    await expect(
      page.getByRole("button", { name: "Registrar pago" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Crear Cuenta" }),
    ).toHaveCount(0);

    await selectClient(page, data.client.clientName);

    await expect(page.locator("#collection-method")).toHaveValue("CASH");
    const cedisSelect = page.locator("#collection-cedis");
    if ((await cedisSelect.count()) > 0) {
      await expect(cedisSelect).not.toHaveValue("");
    } else {
      await expect(
        page.getByText("CEDIS", { exact: true }).first(),
      ).toBeVisible();
    }
    const amount = Number(
      await page.locator("#collection-amount").inputValue(),
    );
    expect(amount).toBeGreaterThan(0);

    if (!data.clientAvailability.writable && data.clientAvailability.message) {
      await expect(
        page.getByText(data.clientAvailability.message),
      ).toBeVisible();
    }

    await assertNoMojibake(page);
    expect(errors).toEqual([]);
  });

  test("despacho muestra el viaje, contado e impresión", async ({ page }) => {
    const errors = await openCobranza(page);

    await selectCollector(page);
    await page.getByRole("tab", { name: "Despacho" }).click();
    await setTripDate(page, data.tripDate);
    await expandTrip(page, data.trip);

    await expect(
      page.getByRole("button", { name: "Imprimir hoja" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Imprimir día" }),
    ).toBeVisible();

    if (data.trip.clients.some((client) => client.accountingEntityId == null)) {
      await expect(page.getByText("Contado").first()).toBeVisible();
    }

    if (!data.tripAvailability.writable && data.tripAvailability.message) {
      await expect(page.getByText(data.tripAvailability.message)).toBeVisible();
    }

    const [sheet] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Imprimir hoja" }).click(),
    ]);
    await expect(sheet).toHaveTitle(/hoja-de-cobranza/);
    await sheet.close();

    const [daySheet] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Imprimir día" }).click(),
    ]);
    await expect(daySheet).toHaveTitle(/hoja-de-cobranza-dia/);
    await daySheet.close();

    await assertNoMojibake(page);
    expect(errors).toEqual([]);
  });

  test("cliente registra, advierte duplicado, alimenta caja y se cancela", async ({
    page,
  }) => {
    test.skip(!ALLOW_WRITES, "E2E_ALLOW_WRITES no está activo");
    const errors = await openCobranza(page);
    const payerId = data.client.accountingEntityId as number;
    const before = await getOpenDebt(payerId);

    await selectClient(page, data.client.clientName);
    await page.locator("#collection-amount").fill(String(WRITE_AMOUNT));

    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/accounting/payments/fifo") &&
          candidate.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Registrar cobro" }).click(),
    ]);

    expect(response.status()).toBe(201);
    const payment = (await response.json()) as PaymentResponse;
    createdPaymentIds.add(payment.id);

    const payload = response.request().postDataJSON() as Record<
      string,
      unknown
    >;
    expect(payload.payerId).toBe(payerId);
    expect(payload.amount).toBe(WRITE_AMOUNT);
    expect(payload.paymentMethod).toBe("CASH");
    expect(payload.tripId).toBeUndefined();

    await expect(page.getByText(/Cobro registrado/).first()).toBeVisible();
    expect((await getPayment(payment.id))?.status).toBe("ACTIVE");

    await expect.poll(() => getOpenDebt(payerId)).toBeLessThan(before);

    await selectClient(page, data.client.clientName);
    await page.locator("#collection-amount").fill(String(WRITE_AMOUNT));
    await expect(page.getByText(/Ya existe un cobro/)).toBeVisible({
      timeout: 20_000,
    });

    if (data.clientAvailability.writable) {
      await expect
        .poll(() => getCashFlowMovement(payment.id, toIsoDate(new Date())))
        .toBeTruthy();
    }

    await cancelPayment(payment.id);
    await expect
      .poll(async () => (await getPayment(payment.id))?.status)
      .toBe("CANCELLED");
    await expect.poll(() => getOpenDebt(payerId)).toBeCloseTo(before, 2);

    if (data.clientAvailability.writable) {
      await expect
        .poll(() => getCashFlowMovement(payment.id, toIsoDate(new Date())))
        .toBeFalsy();
    }

    await assertNoMojibake(page);
    expect(errors).toEqual([]);
  });

  test("despacho registra cobros por viaje y los cancela", async ({ page }) => {
    test.skip(!ALLOW_WRITES, "E2E_ALLOW_WRITES no está activo");
    const errors = await openCobranza(page);

    await selectCollector(page);
    await page.getByRole("tab", { name: "Despacho" }).click();
    await setTripDate(page, data.tripDate);
    await expandTrip(page, data.trip);

    const amountInputs = page.locator('input[id^="amount-"]');
    const availableRows = await amountInputs.count();
    expect(availableRows).toBeGreaterThan(0);

    const rowsToPay = Math.min(2, availableRows);
    for (let index = 0; index < availableRows; index += 1) {
      await amountInputs.nth(index).fill("0");
    }
    for (let index = 0; index < rowsToPay; index += 1) {
      await amountInputs.nth(index).fill(String(WRITE_AMOUNT));
    }

    const bulkButton = page.getByRole("button", {
      name: new RegExp(`Registrar cobros \\(${rowsToPay}\\)`),
    });
    await expect(bulkButton).toBeVisible();
    await bulkButton.click();

    const confirmButton = page.getByRole("button", {
      name: `Confirmar cobros (${rowsToPay})`,
    });
    await expect(confirmButton).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/accounting/payments/bulk-fifo") &&
          candidate.request().method() === "POST",
      ),
      confirmButton.click(),
    ]);

    expect(response.status()).toBe(201);
    const result = (await response.json()) as {
      created: number;
      paymentIds: number[];
      appliedTotal: number;
      parkedTotal: number;
    };
    expect(result.created).toBe(rowsToPay);
    expect(result.paymentIds).toHaveLength(rowsToPay);
    result.paymentIds.forEach((id) => createdPaymentIds.add(id));

    const payload = response.request().postDataJSON() as Array<
      Record<string, unknown>
    >;
    expect(payload).toHaveLength(rowsToPay);
    payload.forEach((item) => {
      expect(item.tripId).toBe(data.trip.tripId);
      expect(item.amount).toBe(WRITE_AMOUNT);
      expect(item.paymentMethod).toBe("CASH");
    });

    await expect(
      page.getByText(new RegExp(`Se registraron ${rowsToPay} cobros`)).first(),
    ).toBeVisible({ timeout: 20_000 });

    const payments = await getJson<PaymentResponse[]>(
      "/api/accounting/payments/recent?limit=100",
    );
    result.paymentIds.forEach((id) => {
      expect(payments.find((payment) => payment.id === id)?.tripId).toBe(
        data.trip.tripId,
      );
    });

    for (const paymentId of result.paymentIds) {
      if (data.tripAvailability.writable) {
        await expect
          .poll(() => getCashFlowMovement(paymentId, data.tripDate))
          .toBeTruthy();
      }
      await cancelPayment(paymentId);
      await expect
        .poll(async () => (await getPayment(paymentId))?.status)
        .toBe("CANCELLED");
      if (data.tripAvailability.writable) {
        await expect
          .poll(() => getCashFlowMovement(paymentId, data.tripDate))
          .toBeFalsy();
      }
    }

    await assertNoMojibake(page);
    expect(errors).toEqual([]);
  });
});
