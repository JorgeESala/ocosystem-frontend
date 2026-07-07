export interface ClientFormState {
  name: string;
  businessName: string;
  localityId: number | null;
}

export const emptyClientForm: ClientFormState = {
  name: "",
  businessName: "",
  localityId: null,
};

export interface RouteFormState {
  name: string;
}

export const emptyRouteForm: RouteFormState = {
  name: "",
};
