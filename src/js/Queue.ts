/**
 * The queue class allows adding functions to a queue that will be executed
 * after the current function is done.
 * It also allows to shortcut the currently running function.
 * If possible the running function can declare that it will be done in a certain time.
 */
export class Queue {

    protected _is_running: boolean = false;
    protected _entries: QueueEntry[] = [];
    protected _is_about_to_finish: boolean = true;
    protected _shortcut: TriggerFunction | null = null;

    public push(entry: QueueEntry) {
        this._entries.push(entry);
        this.run().catch(console.error);
    }

    public async run() {
        if (this.is_running) {
            return;
        }
        this.is_running = true;
        try {
            while (this._entries.length) {
                const entry = this._entries.shift();
                console.log("entry start", entry);
                if (!entry) continue;
                await (async () => {
                    this._is_about_to_finish = false;
                    this._shortcut = null;
                    return new Promise<void>((resolve, reject) => {
                        const input: RunFunctionInput = {
                            ...entry,
                            failed: ()=>reject(),
                            finished: ()=>resolve(),
                            provide_shortcut: this._provide_shortcut,
                            about_to_finish: this._trigger_about_to_finish
                        };
                        entry.run(input);
                    });
                })()
                    .then(() => {
                        console.log("entry done", entry);
                    })
                    .catch((error) => {
                        console.log("error in entry", entry, error);
                        this.is_running = false;
                    });
            }
        } catch (error) {
            console.log("error in queue outer", error);
            this.is_running = false;
        }
        this.is_running = false;
    }

    public get is_ready_to_push(): boolean {
        return (this._entries.length < 1 && this._is_about_to_finish) || !this.is_running;
    };

    protected get is_running() {
        return this._is_running;
    }

    protected set is_running(value: boolean) {
        console.log("set is_running", value);
        this._is_running = value;
    }

    protected _provide_shortcut = (shortcut: TriggerFunction) => {
        this._shortcut = shortcut;
    };

    /**
     * Marks the current element as about to finish
     * @protected
     */
    protected _trigger_about_to_finish = () => {
        this._is_about_to_finish = true;
    };

    /**
     * Shortcuts the currently running function
     */
    public shortcut(): boolean {
        if (this._shortcut) {
            this._shortcut();
            return true;
        }
        return false;
    }

}

type QueueEntry = {
    run: RunFunction,
}

export type RunFunctionInput = QueueEntry & {
    about_to_finish?: TriggerFunction,
    failed: ((e: Error) => void),
    finished: TriggerFunction,
    provide_shortcut: (callback: TriggerFunction) => void,
}

type RunFunction = (self: RunFunctionInput) => void;
type TriggerFunction = () => void;

