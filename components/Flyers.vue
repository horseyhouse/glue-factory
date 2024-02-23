<script setup lang="ts">
import { reactive } from 'vue'

const paths = import.meta.glob("/media/flyers/*");

function pathToDate(path: string): Date {
    // Regex that extracts the filename from the path, without extension
    const filename = path.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')

    return new Date(filename)
}

const pathsAndDates = Object.keys(paths)
    // Compute a date for each path
    .map((path: string) => ({
        path,
        date: pathToDate(path)
    }))
    // Sort by the date
    .sort((a, b) => b.date.getTime() - a.date.getTime())

// Resolved paths
const resolvedPaths = reactive({})
pathsAndDates.forEach(({ path }) => {
    paths[path]().then(
        module => resolvedPaths[path] = module.default)
})
</script>

<template>
    <ul>
        <li v-for="{ path, date } of pathsAndDates">
            <figure>
                <caption>
                    {{ date.toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }) }}
                </caption>
                <img :src="resolvedPaths[path]">
            </figure>
        </li>
    </ul>
</template>

<style>
ul {
    list-style: none;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

li {
    flex: 1;
}

figure {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 11rem;
    border: 1px solid #ccc;
    padding: 1rem;
}

img {
    width: 100%;
    height: auto;
    border: 1px solid #ccc;
}

caption {
    text-align: center;
    width: 100%;
}
</style>
