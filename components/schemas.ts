import type { GraffitiObject, JSONSchema } from "@graffiti-garden/api";

export const flyerSchema = {
  properties: {
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
