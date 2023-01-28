import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

const ContinentRef = builder.objectRef("Continent");

builder.objectType(ContinentRef, {
  name: "Continent",
  fields: (t) => ({
    code: t.exposeString("code"),
  }),
});

builder.queryType({
  fields: (t) => ({
    continents: t.field({
      type: ContinentRef,
    }),
  }),
});

export const schema = builder.toSchema();
