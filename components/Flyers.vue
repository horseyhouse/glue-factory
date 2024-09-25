<script setup lang="ts">
import { computed, ref, nextTick, useTemplateRef } from "vue";
import {
    useDiscover,
    useGraffiti,
    useGraffitiSession,
    type GraffitiObjectTyped,
} from "@graffiti-garden/client-vue";
import { flyerSchema } from "./schemas";

const graffiti = useGraffiti();
const session = useGraffitiSession();
session.value.pods = ["https://pod.graffiti.garden"];
const channel = "The Glue Factory";
const { results: flyers, isPolling } = useDiscover([channel], flyerSchema);
const flyersSorted = computed(() =>
    flyers.value.sort(
        (a, b) =>
            new Date(b.value.startTime).getTime() -
            new Date(a.value.startTime).getTime(),
    ),
);

function prettyDate(date: string) {
    return new Date(date).toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

const selectedFlyer = ref<null | GraffitiObjectTyped<typeof flyerSchema>>(null);
function selectFlyer(flyer: GraffitiObjectTyped<typeof flyerSchema>) {
    selectedFlyer.value = flyer;
    nextTick(() => {
        const closeButton = document.getElementById("dialog-close");
        closeButton?.focus();
    });
}
function unselectFlyer() {
    if (selectedFlyer.value) {
        const originalButton = document.getElementById(
            `see-more-${graffiti.objectToUrl(selectedFlyer.value)}`,
        );
        selectedFlyer.value = null;
        originalButton?.focus();
    }
}
function clickAway(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        unselectFlyer();
    }
}
// Press escape to close the dialog
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        unselectFlyer();
    }
});
</script>

<template>
    <p v-if="isPolling">Loading...</p>
    <ul class="flyers">
        <li v-for="flyer of flyersSorted">
            <button
                @click="selectFlyer(flyer)"
                :id="`see-more-${graffiti.objectToUrl(flyer)}`"
                aria-label="read more"
            >
                <figure>
                    <figcaption>
                        {{ prettyDate(flyer.value.startTime) }}
                    </figcaption>
                    <img
                        :src="(flyer.value.attachment as any)[0].url"
                        :alt="(flyer.value.attachment as any)[0].alt"
                    />
                </figure>
            </button>
        </li>
    </ul>
    <dialog v-if="selectedFlyer" open @click="clickAway">
        <button @click="unselectFlyer" id="dialog-close">close</button>
        <figure @click="clickAway">
            <img
                :src="(selectedFlyer.value.attachment as any)[0].url"
                :alt="(selectedFlyer.value.attachment as any)[0].alt"
            />
            <figcaption>
                <h2>{{ prettyDate(selectedFlyer.value.startTime) }}</h2>
                <p v-html="selectedFlyer.value.content"></p>
            </figcaption>
        </figure>
        <button @click="unselectFlyer" style="margin-top: auto">close</button>
    </dialog>
</template>

<style>
ul.flyers {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 2rem;

    button {
        font: inherit;
        background: none;
        border: none;
        color: inherit;
    }

    figure {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 15rem;
        height: 100%;
        width: 100%;
        cursor: pointer;
    }

    img {
        width: 100%;
        height: auto;
        box-shadow: 0 0 0.7rem pink;
    }
}

dialog {
    overflow: auto;
    position: fixed;
    border: none;
    width: 100dvw;
    height: 100dvh;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(0.2rem);
    color: inherit;
    display: flex;
    flex-direction: column;

    button {
        width: 100%;
        background: #111;
        color: inherit;
        font: inherit;
        font-size: 1.5rem;
        border: none;
        border: 1px solid #555;
        cursor: pointer;
        padding: 0.5rem;
    }

    button:hover {
        background: #555;
    }

    figure {
        width: 100%;
        max-width: 40rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-items: center;
        gap: 1rem;
        padding: 1rem;
        margin: auto;

        img {
            width: 100%;
            height: auto;
            box-shadow: 0 0 0.7rem pink;
        }

        figcaption {
            box-shadow: 0 0 0.7rem pink;
            padding: 1rem;
            background: #111;
            border-radius: 0.5rem;
            color: inherit;
            max-width: 30rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;

            p {
                text-align: left;
                white-space: pre-wrap;
            }
        }
    }
}
</style>
