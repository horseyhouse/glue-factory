<script setup lang="ts">
import type {
    GraffitiObject,
    GraffitiSession,
    JSONSchema,
} from "@graffiti-garden/api";
import { useGraffiti, useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { ref } from "vue";
import { pointHorsies } from "./schemas";

const props = defineProps<{
    inReplyTo: string;
    replyBoxOpen: boolean;
}>();

const openReplyBoxes = ref(new Map<string, boolean>());

const replySchema = () =>
    ({
        properties: {
            value: {
                required: ["content", "inReplyTo", "published"],
                properties: {
                    content: { type: "string" },
                    inReplyTo: { const: props.inReplyTo },
                    published: { type: "number" },
                },
            },
        },
    }) as const satisfies JSONSchema;

const removeSchema = () =>
    ({
        properties: {
            value: {
                required: ["activity"],
                properties: {
                    activity: { const: "Remove" },
                    target: { type: "string" },
                },
            },
            actor: { enum: pointHorsies.keys().toArray() },
        },
    }) as const satisfies JSONSchema;

const { objects: repliesAll } = useGraffitiDiscover(
    () => [props.inReplyTo],
    () => replySchema(),
    undefined,
    true,
);

const { objects: deletes } = useGraffitiDiscover(
    () => [props.inReplyTo],
    () => removeSchema(),
);

// Filter out deleted replies
type ReplyObject = GraffitiObject<ReturnType<typeof replySchema>>;
const replies = () => {
    const repliesAll_: ReplyObject[] = repliesAll.value;
    return repliesAll_.filter(
        (reply) =>
            !deletes.value.some((deleteReply) => {
                return deleteReply.value.target === reply.url;
            }),
    );
};

const replying = ref(false);
const reply = ref("");
const crosspost = ref(true);
async function submitReply(session: GraffitiSession) {
    replying.value = true;

    await useGraffiti().put<ReturnType<typeof replySchema>>(
        {
            value: {
                content: reply.value,
                inReplyTo: props.inReplyTo,
                published: Date.now(),
            },
            channels: [props.inReplyTo, ...(crosspost ? [session.actor] : [])],
        },
        session,
    );

    // Submit the reply
    replying.value = false;
    reply.value = "";
}

const deleting = ref(false);
async function deleteReply(reply: ReplyObject, session: GraffitiSession) {
    deleting.value = true;
    if (reply.actor === session.actor) {
        await useGraffiti().delete(reply, session);
    } else {
        const target = reply.url;
        await useGraffiti().put<ReturnType<typeof removeSchema>>(
            {
                value: {
                    activity: "Remove",
                    target,
                },
                channels: [props.inReplyTo, target],
            },
            session,
        );
    }
    deleting.value = false;
}
</script>

<template>
    <section>
        <form
            v-if="replyBoxOpen && $graffitiSession.value"
            @submit.prevent="submitReply($graffitiSession.value)"
        >
            <textarea
                v-model="reply"
                placeholder="Write a reply..."
                rows="3"
                required
            ></textarea>
            <!-- <label>
                Crosspost to
                <a href="https://glitter.graffiti.garden/">glitter</a>?
                <input type="checkbox" v-model="crosspost" />
            </label> -->
            <input
                type="submit"
                :value="replying ? 'Replying...' : `Reply`"
                :disabled="replying || !reply"
            />
            <!-- <button @click.prevent="$graffiti.logout($graffitiSession.value)">
                Switch account
            </button> -->
        </form>
        <button v-else-if="replyBoxOpen" @click="$graffiti.login()">
            Log in to reply
        </button>

        <ul>
            <li
                v-for="reply in replies().toSorted(
                    (a, b) => b.value.published - a.value.published,
                )"
                :key="reply.url"
            >
                <article>
                    <header>
                        <h3>
                            {{ reply.actor }}
                        </h3>
                        <!-- <time
                            :datetime="
                                new Date(reply.value.published).toISOString()
                            "
                        >
                            {{
                                new Date(reply.value.published).toLocaleString(
                                    [],
                                    {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    },
                                )
                            }}
                        </time> -->
                    </header>
                    <main>
                        <p>
                            {{ reply.value.content }}
                        </p>
                    </main>
                    <footer>
                        <nav>
                            <ul>
                                <li>
                                    <button
                                        @click="
                                            openReplyBoxes.set(
                                                reply.url,
                                                !openReplyBoxes.get(reply.url),
                                            )
                                        "
                                    >
                                        Reply
                                    </button>
                                </li>
                                <li>
                                    <button
                                        v-if="
                                            $graffitiSession.value &&
                                            (pointHorsies.has(
                                                $graffitiSession.value.actor,
                                            ) ||
                                                $graffitiSession.value.actor ===
                                                    reply.actor)
                                        "
                                        @click="
                                            deleteReply(
                                                reply,
                                                $graffitiSession.value,
                                            )
                                        "
                                    >
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </footer>
                </article>
                <Replies
                    :inReplyTo="reply.url"
                    :replyBoxOpen="!!openReplyBoxes.get(reply.url)"
                />
            </li>
        </ul>
    </section>
</template>

<style>
section {
    max-width: 30rem;
    width: 100%;
    display: flex;
    box-shadow: 0 0 0.7rem pink;
    margin: auto;
    flex-direction: column;
    border-radius: 0.5rem;
    background: #111;
    margin-bottom: 1rem;

    article + section:has(ul li) {
        margin-top: 1rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #555;

        label {
            align-self: flex-start;
        }

        a {
            text-decoration: underline;
        }
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    textarea {
        height: 2rem;
    }

    li {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        border-bottom: 1px solid #555;

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0;

            h3 {
                margin: 0;
                font-size: 1rem;
                color: #ccc;
                text-align: left;
            }

            time {
                font-size: 0.8rem;
                color: #aaa;
            }
        }

        main {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            p {
                font-size: 1.2rem;
                color: inherit;
                text-align: right;
            }
        }

        footer {
            display: flex;
            justify-content: flex-start;
            padding: 0;
            margin: 0;

            nav {
                ul {
                    flex-direction: row;
                    li {
                        padding: 0;

                        button {
                            /* border: 1px solid #555; */
                            font-size: 0.8rem;
                            /* padding: 0.5rem; */
                            color: #ccc;
                            padding: 0;
                            border: 0;
                        }
                    }
                }
            }
        }
    }
}
</style>
