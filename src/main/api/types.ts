export interface PrintBody {
  CMD: string;
  ARGS: any;
}

export interface ActionPrintBody {
  arg: PrintBody[];
}
