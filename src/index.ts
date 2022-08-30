import type { Request, Response } from "express";
import type { IncomingHttpHeaders } from "http";
import type { ParamsDictionary, Query } from "express-serve-static-core";

type BuildRequest<T = Request> = T extends Request<
  infer params,
  any,
  infer body,
  infer query
>
  ? {
      params: params;
      body: body;
      query: query;
    }
  : never;

type Reqwest<Params, Body, ReqQuery> = Request<Params, any, Body, ReqQuery>;

type DefBody = Record<string, unknown>;

export type RequestData<
  ExpressMainArgs extends {
    body?: BuildRequest<Request>["body"];
    query?: BuildRequest<Request>["query"];
    params?: BuildRequest<Request>["params"];
    headers?: IncomingHttpHeaders;
  } = {
    body: undefined;
    query: undefined;
    params: undefined;
    headers: undefined;
  },
  Params = ExpressMainArgs["params"] extends ParamsDictionary
    ? ExpressMainArgs["params"]
    : ParamsDictionary,
  Body = ExpressMainArgs["body"] extends DefBody
    ? ExpressMainArgs["body"]
    : Record<string, unknown>,
  ReqQuery = ExpressMainArgs["query"] extends Query
    ? ExpressMainArgs["query"]
    : Query,
  Req = Request<Params, any, Body, ReqQuery>
> = ExpressMainArgs["headers"] extends undefined
  ? Reqwest<Params, Body, ReqQuery>
  : Reqwest<Params, Body, ReqQuery> & {
      headers: ExpressMainArgs["headers"];
    };

type Interface<T, Ty = "query" | "body"> = T extends Reqwest<
  infer P,
  infer B,
  infer Q
>
  ? {
      name: string;
    }
  : never;

type Interface2<T, Ty = "query" | "body"> = T extends Reqwest<
  infer P,
  infer B,
  infer Q
>
  ? Ty extends "query"
    ? {
        eventData(req: T): Q;
        name: string;
      }
    : { name: string; eventData(req: T): Q }
  : { name: string; eventData(req: T): Record<string, unknown> };

type MakeHandle<T extends Request> = {
  handle(req: T, res: Response): void;
};

function hello<T extends RequestData>({
  name,
  eventData,
}: Interface2<T, "query">): MakeHandle<T> {
  return {
    handle(req, res) {
      req.query;
    },
  };
}
function goodBye<T extends string>({ name }: Interface<T, "body">) {}

type EventData<
  V extends "query" | "body" | "params",
  T extends RequestData,
  Section = T[V]
> = (req: T) => Section;

type V = "query" | "body" | "params";

declare function test<T extends RequestData = RequestData>(key: V): T[V];

type EventData2<R> = (key: V) => R;
type J<
  T extends RequestData = RequestData,
  R = keyof Pick<BuildRequest, "params" | "body" | "query">
> = (config: {
  eventData: (
    v: V
  ) => V extends "body"
    ? { body: { data: string } }
    : V extends "query"
    ? { query: { name: string } }
    : { params: { name: string } };
}) => {
  handle(req: T, res: Response): void;
};

const j: J = (config) => {
  return {
    handle(req, res) {
      //
    },
  };
};

j({
  eventData(v) {},
});

const d = test<RequestData<{ body: { body: { string: string[] } } }>>("body");

hello({
  eventData() {
    return {};
  },
  name: "hello",
});

// hello({
// 	eventData
// });

// import type { Equal, Expect } from "@type-challenges/utils";

// type Fn = (...args: any[]) => any;

// type FieldReturnTypes<T> = {
//   [K in keyof T]: T[K] extends Fn ? ReturnType<T[K]> : never;
// };

// type Options<D, C, M> = {
//   data: (this: void) => D;
//   computed: C & ThisType<D>;
//   methods: M & ThisType<FieldReturnTypes<C> & D & M>;
// };
// declare function SimpleVue<D, C, M>(options: Options<D, C, M>): any;

// SimpleVue({
//   data() {
//     // @ts-expect-error
//     this.firstname;
//     // @ts-expect-error
//     this.getRandom();
//     // @ts-expect-error
//     this.data();

//     return {
//       firstname: "Type",
//       lastname: "Challenges",
//       amount: 10,
//     };
//   },
//   computed: {
//     fullname() {
//       return `${this.firstname} ${this.lastname}`;
//     },
//   },
//   methods: {
//     getRandom() {
//       return Math.random();
//     },
//     hi() {
//       alert(this.amount);
//       alert(this.fullname.toLowerCase());
//       alert(this.getRandom());
//     },
//     test() {
//       const fullname = this.fullname;
//       const cases: [Expect<Equal<typeof fullname, string>>] = [] as any;
//     },
//   },
// });
