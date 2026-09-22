export interface ClientFormState {
  name: string;
  businessName: string;
  localityId: number | null;
  phone: string;
  address: string;
}

export const emptyClientForm: ClientFormState = {
  name: "",
  businessName: "",
  localityId: null,
  phone: "",
  address: "",
};

export interface RouteFormState {
  name: string;
  localityIds: number[];
  deliveryDays: number[];
}

export const emptyRouteForm: RouteFormState = {
  name: "",
  localityIds: [],
  deliveryDays: [],
};
