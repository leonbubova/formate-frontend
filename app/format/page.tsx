"use client";
import {useState, Fragment} from "react";
import {
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {Title} from "@components/title";
import {ErrorMessage} from "@components/error";
import OpenAI from "openai";
import * as process from "process";

export default function Home() {
    const [input, setInput] = useState("01701234567\n" +
        "01711234567\n" +
        "01721234567\n" +
        "01731234567\n" +
        "01741234567\n" +
        "01751234567\n" +
        "01761234567");
    const [output, setOutput] = useState("+49 170-1234567\n" +
        "+49 171-1234567\n" +
        "+49 172-1234567");
    const [reads, setReads] = useState(999);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async () => {
        callNodeBackend()
    };
    const callNodeBackend = async () => {
        async function* getIterableStream(
            body: ReadableStream<Uint8Array>
        ): AsyncIterable<string> {
            const reader = body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const {value, done} = await reader.read()
                if (done) {
                    break
                }
                const decodedChunk = decoder.decode(value, {stream: true})
                yield decodedChunk
            }
        }

        const generateStream = async (): Promise<AsyncIterable<string>> => {
            setError("");
            setLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/format`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({input: input, output: output}),
                },
            )
            if (response.status !== 200) throw new Error(response.status.toString())
            if (!response.body) throw new Error('Response body does not exist')
            return getIterableStream(response.body)
        }

        const stream = await generateStream()
        setOutput(" ")
        setLoading(false)
        let delta = ""
        for await (const chunk of stream) {
            console.log(chunk)
            delta += chunk
            setOutput(delta)
        }
    }

    return (
        <div className="container px-8 mx-auto mt-16 lg:mt-32 ">
            {error ? <ErrorMessage message={error}/> : null}
            <form
                className="max-w-3xl mx-auto"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (input.length <= 0) return;
                    onSubmit();

                }}
            >
                <Title>Format Data</Title>

                <pre
                    className="px-4 py-3 mt-8 font-mono text-left bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
            <div className="flex items-start px-1 text-sm">
              <div aria-hidden="true"
                   className="pr-4 font-mono border-r select-none border-zinc-300/5 text-zinc-700">
                {Array.from({
                    length: input.split("\n").length,
                }).map((_, index) => (
                    <Fragment key={index}>
                        {(index + 1).toString().padStart(2, "0")}
                        <br/>
                    </Fragment>
                ))}
              </div>

              <textarea
                  id="text"
                  name="text"
                  value={input}
                  minLength={1}
                  onChange={(e) => setInput(e.target.value)}
                  rows={Math.max(7, input.split("\n").length)}
                  placeholder={`//Your input data${"\n\n"}e1271e8e-e656-4c91-bd82-78553cfffaec${"\n"}f534c246-29eb-41b3-8060-9ff9db629872${"\n"}55fa9c77-ad13-442d-a60d-cb0dbd588c02`}
                  className="w-full p-0 text-base bg-transparent border-0 appearance-none resize-none hover:resize text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
              />
            </div>
          </pre>
                <pre
                    className="px-4 py-3 mt-4 font-mono text-left bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
            <div className="flex items-start px-1 text-sm">
              <div aria-hidden="true"
                   className="pr-4 font-mono border-r select-none border-zinc-300/5 text-zinc-700">
                {Array.from({
                      length: output.split("\n").length,
                  }).map((_, index) => (
                      <Fragment key={index}>
                          {(index + 1).toString().padStart(2, "0")}
                          <br/>
                      </Fragment>
                  ))}
              </div>

              <textarea
                  id="text"
                  name="text"
                  value={output}
                  minLength={1}
                  onChange={(e) => setOutput(e.target.value)}
                  rows={Math.max(7, output.split("\n").length)}
                  placeholder={`//Your output format example${"\n\n"}{${"\n"}  "e1271e8e-e656-4c91-bd82-78553cfffaec",${"\n"}  "f534c246-29eb-41b3-8060-9ff9db629872",${"\n"}  "55fa9c77-ad13-442d-a60d-cb0dbd588c02"${"\n"}}`}
                  className="w-full p-0 text-base bg-transparent border-0 appearance-none resize-none hover:resize text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
              />
            </div>
          </pre>

                {/*<div*/}
                {/*    className="flex flex-col items-center justify-center w-full gap-4 mt-4 sm:flex-row">*/}
                {/*    <div className="w-full sm:w-1/5">*/}
                {/*        <label*/}
                {/*            className="flex items-center justify-center h-16 px-3 py-2 text-sm whitespace-no-wrap duration-150 border rounded hover:border-zinc-100/80 border-zinc-600 focus:border-zinc-100/80 focus:ring-0 text-zinc-100 hover:text-white hover:cursor-pointer "*/}
                {/*            htmlFor="file_input"*/}
                {/*        >*/}
                {/*            Upload a file*/}
                {/*        </label>*/}
                {/*        <input*/}
                {/*            className="hidden"*/}
                {/*            id="file_input"*/}
                {/*            type="file"*/}
                {/*            onChange={(e) => {*/}
                {/*                const file = e.target.files![0];*/}
                {/*                if (file.size > 1024 * 16) {*/}
                {/*                    setError("File size must be less than 16kb");*/}
                {/*                    return;*/}
                {/*                }*/}

                {/*                const reader = new FileReader();*/}
                {/*                reader.onload = (e) => {*/}
                {/*                    const t = e.target!.result as string;*/}
                {/*                    setText(t);*/}
                {/*                };*/}
                {/*                reader.readAsText(file);*/}
                {/*            }}*/}
                {/*        />*/}
                {/*    </div>*/}

                {/*    <div*/}
                {/*        className="w-full h-16 px-3 py-2 duration-150 border rounded sm:w-2/5 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">*/}
                {/*        <label htmlFor="reads"*/}
                {/*               className="block text-xs font-medium text-zinc-100">*/}
                {/*            READS*/}
                {/*        </label>*/}
                {/*        <input*/}
                {/*            type="number"*/}
                {/*            name="reads"*/}
                {/*            id="reads"*/}
                {/*            className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"*/}
                {/*            value={reads}*/}
                {/*            onChange={(e) => setReads(e.target.valueAsNumber)}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*    <div*/}
                {/*        className="relative w-full h-16 px-3 py-2 duration-150 border rounded sm:w-2/5 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">*/}
                {/*        <label htmlFor="reads"*/}
                {/*               className="block text-xs font-medium text-zinc-100">*/}
                {/*            TTL*/}
                {/*        </label>*/}
                {/*        <input*/}
                {/*            type="number"*/}
                {/*            name="reads"*/}
                {/*            id="reads"*/}
                {/*            className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"*/}
                {/*            value={ttl}*/}
                {/*            onChange={(e) => setTtl(e.target.valueAsNumber)}*/}
                {/*        />*/}
                {/*        <div*/}
                {/*            className="absolute inset-y-0 right-0 flex items-center">*/}
                {/*            <label htmlFor="ttlMultiplier" className="sr-only"/>*/}
                {/*            <select*/}
                {/*                id="ttlMultiplier"*/}
                {/*                name="ttlMultiplier"*/}
                {/*                className="h-full py-0 pl-2 bg-transparent border-0 border-transparent rounded pr-7 text-zinc-500 focus:ring-0 sm:text-sm"*/}
                {/*                onChange={(e) => setTtlMultiplier(parseInt(e.target.value))}*/}
                {/*                defaultValue={60 * 60 * 24}*/}
                {/*            >*/}
                {/*                <option*/}
                {/*                    value={60}>{ttl === 1 ? "Minute" : "Minutes"}</option>*/}
                {/*                <option*/}
                {/*                    value={60 * 60}>{ttl === 1 ? "Hour" : "Hours"}</option>*/}
                {/*                <option*/}
                {/*                    value={60 * 60 * 24}>{ttl === 1 ? "Day" : "Days"}</option>*/}
                {/*            </select>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <button
                    type="submit"
                    disabled={loading || input.length <= 0 || output.length <= 0}
                    className={`mt-6 w-full h-12 inline-flex justify-center items-center  transition-all  rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7    bg-zinc-200 ring-1 ring-transparent duration-150   ${
                        input.length <= 0 || output.length <= 0
                            ? "text-zinc-400 cursor-not-allowed"
                            : "text-zinc-900 hover:text-zinc-100 hover:ring-zinc-600/80  hover:bg-zinc-900/20"
                    } ${loading ? "animate-pulse" : ""}`}
                >
                    <span>{loading ? <Cog6ToothIcon
                        className="w-5 h-5 animate-spin"/> : "Let AI Do The Boring Work!"}</span>
                </button>

                <div className="mt-8">
                    <ul className="space-y-2 text-xs text-zinc-500">
                        <li>
                            <p>
                                <span
                                    className="font-semibold text-zinc-400">Input:</span> The
                                data you want to format yada yada...

                            </p>
                        </li>
                        <li>
                            <p>
                                <span
                                    className="font-semibold text-zinc-400">Output format:</span> 3
                                example rows of the format you want data to
                                be
                                in something something
                                data, to automatically delete it after a
                                certain
                                amount of time. 0 means no TTL.
                            </p>
                        </li>
                        <p>Submitting will output your input data in the
                            desired
                            format.</p>
                    </ul>
                </div>
            </form>
            )
        </div>
    );
}
