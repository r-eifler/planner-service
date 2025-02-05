export interface Action {
    name: string;
    params: string[];
}

export interface ActionSet {
    _id: string;
    name: string;
    actions: Action[];
}
