<script setup lang="ts">
import { ref, computed } from "vue";
import {
    useGraffiti,
    useDiscover,
    useGraffitiSession,
    registerSolidSession,
    GraffitiIdentityProviderLogin,
    type GraffitiObjectTyped,
    type GraffitiLocalObjectTyped,
} from "@graffiti-garden/client-vue";
import "@graffiti-garden/client-vue/dist/style.css";

const redirectUrl = window.location.toString();
registerSolidSession({
    whichPod: () => "http://localhost:3000",
});

const flyerSchema = {
    properties: {
        value: {
            required: ["startTime", "content", "location", "attachment"],
            properties: {
                startTime: {
                    type: "string",
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
} as const;

const channel = "The Glue Factory";

const graffiti = useGraffiti();
const session = useGraffitiSession();
session.value.pods = ["https://pod.graffiti.garden", "http://localhost:3000"];

const defaultTime = new Date();
defaultTime.setMonth(defaultTime.getMonth() + 1);
defaultTime.setDate(defaultTime.getDate() + (6 - defaultTime.getDay()));
defaultTime.setHours(18, 0, 0, 0);
defaultTime.setMinutes(
    defaultTime.getMinutes() - defaultTime.getTimezoneOffset(),
);
const defaultTimeString = defaultTime.toISOString().slice(0, 16);
const startTime = ref<string>(defaultTimeString);
const content = ref("");
const alt = ref("");
const imageUrl = ref("");
async function putFlyer() {
    if (!session.value.webId) {
        return alert("You must be logged in horsie");
    }
    if (!startTime.value) {
        return alert("Please provide a start time horsie");
    }
    if (!content.value) {
        return alert("Please provide a description horsie");
    }
    if (!imageUrl.value) {
        return alert("Please provide an image URL horsie");
    }
    if (!alt.value) {
        return alert(
            "Please provide an alt text horsie, not all horsies can see images",
        );
    }

    const object = {
        value: {
            startTime: startTime.value,
            content: content.value,
            location: "ask a horse",
            attachment: [
                {
                    type: "Image",
                    url: imageUrl.value,
                    alt: alt.value,
                },
            ],
        },
        channels: [channel],
    } satisfies GraffitiLocalObjectTyped<typeof flyerSchema>;

    if (editingUrl.value) {
        await graffiti.put<typeof flyerSchema>(
            object,
            editingUrl.value,
            session.value,
        );
    } else {
        await graffiti.put<typeof flyerSchema>(object, session.value);
    }
    startTime.value = "";
    content.value = "";
    imageUrl.value = "";
    alt.value = "";
    editingUrl.value = null;
}

function deleteFlyer(flyer: GraffitiObjectTyped<typeof flyerSchema>) {
    if (!session.value.webId) {
        return alert("You must be logged in horsie");
    }
    if (
        !confirm(
            "Are you sure you want to delete this flyer horsie? It will be gone forever",
        )
    ) {
        return;
    }
    graffiti.delete(flyer, session.value);
}

const editingUrl = ref<string | null>(null);
function startEditingFlyer(flyer: GraffitiObjectTyped<typeof flyerSchema>) {
    startTime.value = flyer.value.startTime;
    content.value = flyer.value.content;
    imageUrl.value = (flyer.value.attachment as any)[0].url;
    alt.value = (flyer.value.attachment as any)[0].alt;
    editingUrl.value = graffiti.objectToUrl(flyer);
    document.getElementById("flyer-editor-form")?.scrollIntoView({
        behavior: "smooth",
    });
}

const { results: flyers } = useDiscover([channel], flyerSchema);
const flyersSorted = computed(() =>
    flyers.value.sort(
        (a, b) =>
            new Date(a.value.startTime).getTime() -
            new Date(b.value.startTime).getTime(),
    ),
);
</script>

<template>
    <div class="admin">
        <h1>⚠️🐴 Real Horsie Area 🐴⚠️</h1>
        <GraffitiIdentityProviderLogin
            client-name="glue factory"
            :redirect-url="redirectUrl"
        />

        <template v-if="session.webId">
            <form @submit.prevent="putFlyer" id="flyer-editor-form">
                <fieldset>
                    <legend>Flyer Editor</legend>

                    <template v-if="editingUrl">
                        <label for="editing-url">Editing flyer with URL</label>
                        <input
                            id="editing-url"
                            type="text"
                            readonly
                            v-model="editingUrl"
                        />
                        <button @click="editingUrl = null">
                            Cancel editing
                        </button>
                    </template>

                    <label for="start-time">Doors @</label>
                    <input
                        type="datetime-local"
                        id="start-time"
                        v-model="startTime"
                    />
                    <label for="content">Content</label>
                    <textarea
                        id="content"
                        v-model="content"
                        placeholder="What's happening?"
                    ></textarea>
                    <label for="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        placeholder="https://example.com/image.jpg"
                        v-model="imageUrl"
                    />
                    <label for="alt">Alt text</label>
                    <textarea
                        type="text"
                        id="alt"
                        placeholder="A really cool band flyer..."
                        v-model="alt"
                    ></textarea>

                    <input type="submit" value="Submit Flyer" />
                </fieldset>
            </form>

            <table>
                <caption>
                    Flyers
                </caption>
                <thead>
                    <tr>
                        <th scope="col" class="image-col">Image</th>
                        <th scope="col" class="start-time-col">Start Time</th>
                        <th scope="col" class="content-col">Content</th>
                        <th scope="col" class="alt-col">Alt Text</th>
                        <th scope="col" class="controls-col">Controls</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="flyer in flyersSorted"
                        :key="graffiti.objectToUrl(flyer)"
                    >
                        <td scope="row">
                            <img
                                :src="(flyer.value.attachment as any)[0].url"
                                :alt="(flyer.value.attachment as any)[0].alt"
                            />
                        </td>
                        <td>
                            {{
                                new Date(flyer.value.startTime).toLocaleString()
                            }}
                        </td>
                        <td v-html="flyer.value.content"></td>
                        <td>{{ (flyer.value.attachment as any)[0].alt }}</td>
                        <td>
                            <ul>
                                <li>
                                    <a
                                        :href="graffiti.objectToUrl(flyer)"
                                        title="View"
                                        >🔗</a
                                    >
                                </li>
                                <li>
                                    <button
                                        @click="startEditingFlyer(flyer)"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                </li>
                                <li>
                                    <button
                                        @click="deleteFlyer(flyer)"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
    </div>
</template>

<style>
.admin {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    text-align: left;
    justify-content: center;
    align-items: center;
}

form {
    max-width: 40rem;
    width: 100%;
}

fieldset {
    border: 1px solid grey;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

:is(label, input) + :is(input:not([type="submit"]), textarea) {
    margin-bottom: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td {
    padding: 0.5em;
    white-space: pre-wrap;
    border: 1px solid #555;
    vertical-align: top;
}

td img {
    max-width: 100%;
}

tr:nth-child(even) {
    background-color: #333;
}

.image-col {
    width: 20%;
}
.start-time-col {
    width: 10%;
}
.content-col {
    width: 30%;
}
.alt-col {
    width: 30%;
}

td ul {
    white-space: nowrap;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    align-items: center;
    justify-items: center;
}

td ul li {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

:is(input, textarea) {
    font-size: 1em;
    padding: 0.5rem;
    border: 1px solid #555;
    background-color: #222;
    font-family: inherit;
    color: white;
}

.admin :is(button, a, input[type="submit"]) {
    padding: 0.5rem;
    border: 1px solid #555;
    background: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: inherit;
    font-family: inherit;
}

.admin :is(button, a, input[type="submit"]):hover {
    background-color: #555;
    text-decoration: none;
}
</style>
