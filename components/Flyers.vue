<script setup lang="ts">
import { reactive } from "vue";

const paths = import.meta.glob("/media/flyers/*");

function pathToDate(path: string): Date {
    // Regex that extracts the filename from the path, without extension
    const filename = path
        .replace(/^.*[\\\/]/, "")
        .split(".")
        .slice(0, -1)
        .join(".");

    return new Date(filename);
}

const pathsAndDates = Object.keys(paths)
    // Compute a date for each path
    .map((path: string) => ({
        path,
        date: pathToDate(path),
    }))
    // Sort by the date
    .sort((a, b) => b.date.getTime() - a.date.getTime());

// Resolved paths
const resolvedPaths = reactive(new Map<string, string>());
pathsAndDates.forEach(({ path }) => {
    paths[path]().then((module) => {
        if (
            module &&
            typeof module === "object" &&
            "default" in module &&
            typeof module.default === "string"
        ) {
            resolvedPaths.set(path, module.default);
        }
    });
});
</script>

<template>
    <ul class="flyers">
        <li v-for="{ path, date } of pathsAndDates">
            <figure>
                <figcaption>
                    {{
                        date.toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "UTC",
                        })
                    }}
                </figcaption>
                <img :src="resolvedPaths.get(path)" />
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
