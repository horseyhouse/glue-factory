<script setup lang="ts">
import { computed } from "vue";
import { useDiscover, useGraffitiSession } from "@graffiti-garden/client-vue";
import { flyerSchema } from "./schemas";

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
</script>

<template>
    <p v-if="isPolling">Loading...</p>
    <ul class="flyers">
        <li v-for="flyer of flyersSorted">
            <figure>
                <figcaption>
                    {{
                        new Date(flyer.value.startTime).toLocaleString(
                            undefined,
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                timeZone: "UTC",
                            },
                        )
                    }}
                </figcaption>
                <img
                    :src="(flyer.value.attachment as any)[0].url"
                    :alt="(flyer.value.attachment as any)[0].alt"
                />
            </figure>
        </li>
    </ul>
</template>

<style>
ul.flyers {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 2rem;

    figure {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 15rem;
        height: 100%;
        width: 100%;
    }

    img {
        width: 100%;
        height: auto;
        box-shadow: 0 0 0.7rem pink;
    }
}
</style>
