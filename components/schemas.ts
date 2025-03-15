import type { GraffitiObject, JSONSchema } from "@graffiti-garden/api";

export const pointHorsies = new Map<string, string>([
  ["theia", "Theia"],
  ["https://solid.theias.place/profile/card#me", "Theia"],
]);

export const flyerSchema = {
  properties: {
    actor: {
      enum: Array.from(pointHorsies.keys()),
    },
    value: {
      required: ["startTime", "content", "location", "attachment"],
      properties: {
        startTime: {
          type: "number",
        },
        content: {
          type: "string",
        },
        location: {
          type: "string",
        },
        attachment: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["type", "url", "alt"],
            properties: {
              type: {
                type: "string",
                enum: ["Image"],
              },
              url: {
                type: "string",
              },
              alt: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
} as const satisfies JSONSchema;

export type Flyer = GraffitiObject<typeof flyerSchema>;
