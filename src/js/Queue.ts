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

    public async push(entry: QueueEntry) : Promise<void> {
        this._entries.push(entry);
        const run = this.run();
        run.catch(console.error);
        return run;
    }

    public async run() {
        if (this.is_running) {
            return;
        }
        this.is_running = true;
        try {
            while (this._entries.length) {
                const entry = this._entries.shift();
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
                        this._shortcut = null;
                    })
                    .catch((error) => {
                        console.log("error in entry", entry, error);
                        this.is_running = false;
                        this._shortcut = null;
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

    public is_empty(): boolean {
        return this._entries.length < 1;
    }

}

type QueueEntry = {
    run: RunFunction,
}

/**
 * The input for the run function on the queue
 * @property about_to_finish - Function that is called to check if the action can be shortcut
 * @property failed - Function that is called when the action failed
 * @property finished - Function that is called when the action is done
 * @property provide_shortcut - Function that is called to provide a shortcut
 */
export type RunFunctionInput = QueueEntry & {
    about_to_finish?: TriggerFunction,
    failed: ((e: Error) => void),
    finished: TriggerFunction,
    provide_shortcut: (callback: TriggerFunction) => void,
}

type RunFunction = (self: RunFunctionInput) => void;
type TriggerFunction = () => void;

