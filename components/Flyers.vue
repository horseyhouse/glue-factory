<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import {
    useGraffitiDiscover,
    useGraffiti,
    useGraffitiGet,
} from "@graffiti-garden/wrapper-vue";
import { flyerSchema, type Flyer } from "./schemas";
import Replies from "./Replies.vue";

const channel = "The Glue Factory";
const { objects: flyers, isInitialPolling } = useGraffitiDiscover(
    [channel],
    flyerSchema,
);

const flyersSorted = computed(() =>
    flyers.value.sort((a, b) => b.value.startTime - a.value.startTime),
);

function prettyDate(date: number) {
    return new Date(date).toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const selectedFlyer = ref<null | Flyer>(null);

const hash = window.location.hash.slice(1);
if (hash.length) {
    const { object: hashFlyer } = useGraffitiGet(hash, flyerSchema);
    watch(hashFlyer, (flyer) => flyer && (selectedFlyer.value = flyer));
}

function selectFlyer(flyer: Flyer) {
    selectedFlyer.value = flyer;
    window.location.hash = flyer.url;
    nextTick(() => {
        const closeButton = document.getElementById("dialog-close");
        closeButton?.focus();
    });
}
function unselectFlyer() {
    if (selectedFlyer.value) {
        window.location.hash = "";
        const originalButton = document.getElementById(
            `see-more-${selectedFlyer.value.url}`,
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
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        unselectFlyer();
    }
});
</script>

<template>
    <p v-if="isInitialPolling || $graffitiSession.value === undefined">
        Loading...
    </p>
    <ul class="flyers">
        <li v-for="flyer of flyersSorted">
            <button
                @click="selectFlyer(flyer)"
                :id="`see-more-${flyer.url}`"
                aria-label="read more"
            >
                <figure>
                    <figcaption>
                        {{ prettyDate(flyer.value.startTime) }}
                    </figcaption>
                    <img
                        :src="flyer.value.attachment[0].url"
                        :alt="flyer.value.attachment[0].alt"
                    />
                </figure>
            </button>
        </li>
    </ul>
    <dialog v-if="selectedFlyer" open @click="clickAway">
        <button @click="unselectFlyer" id="dialog-close">close</button>
        <figure @click="clickAway">
            <img
                :src="selectedFlyer.value.attachment[0].url"
                :alt="selectedFlyer.value.attachment[0].alt"
            />
            <figcaption>
                <h2>{{ prettyDate(selectedFlyer.value.startTime) }}</h2>
                <!-- <p v-html="selectedFlyer.value.content"></p> -->
                <p>
                    Event description redacted while the Graffiti paper is under
                    review!
                </p>
            </figcaption>
        </figure>
        <Replies :inReplyTo="selectedFlyer.url" :replyBoxOpen="true" />
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
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        margin: auto;

        img {
            width: 100%;
            max-width: 30rem;
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
