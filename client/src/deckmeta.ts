export class DeckMeta {
    sync: boolean;
    isPublic: boolean;
    /** UNIX Time */
    created: number;
    /** UNIX Time */
    updated: number;
    
    constructor(sync: boolean, isPublic: boolean, created: number, updated: number) {
        this.sync = sync;
        this.isPublic = isPublic;
        this.created = created;
        this.updated = updated;
    }
}