import { describe, it, expect } from "vitest";
import { buildRouteSheetHtml } from "../utils/routeSheet";

describe("buildRouteSheetHtml", () => {
  it("genera la hoja con clientes, días y escape de HTML", () => {
    const html = buildRouteSheetHtml({
      routeName: "Ruta Centro",
      daysLabel: "Lun, Mie",
      dateLabel: "Generada el 1 ene 2030",
      clients: [
        {
          name: "Juan Pérez",
          businessName: "<script>alert(1)</script>",
          localityName: "Centro",
          phone: "811-123-4567",
          address: "Calle 1",
        },
      ],
    });

    expect(html).toContain("Hoja de ruta · Ruta Centro");
    expect(html).toContain("Lun, Mie");
    expect(html).toContain("Generada el 1 ene 2030");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("Juan Pérez");
    expect(html).toContain("811-123-4567");
    expect(html).toContain("window.print()");
  });
});
