<template>
    <header>
        <h1>The Glue Factory</h1>
        <h3>Somerville, MA</h3>
        <h3>ask a horse</h3>
    </header>
    <nav>
        <ul>
            <li><RouterLink to="/">shows</RouterLink></li>
            <li><RouterLink to="/booking">booking info</RouterLink></li>
        </ul>
    </nav>
    <main>
        <RouterView />
    </main>
    <footer>
        <RouterLink to="/horse"> 🐴 </RouterLink>
    </footer>
</template>

<style>
a {
    text-decoration: none;
    color: inherit;
}

a:hover {
    text-decoration: underline;
}

.router-link-active {
    text-decoration: underline;
}

header {
    padding: 1rem;
}

nav {
    ul {
        list-style-type: none;
        display: flex;
        gap: 2rem;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
    }
}

main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
