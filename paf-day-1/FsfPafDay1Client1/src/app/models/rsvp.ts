import { IRsvp } from "./irsvp.interface";

export class Rsvp implements IRsvp {
    constructor(
        public email: string,
        public given_name: string,
        public phone: string,
        public attending: string,
        public remarks?: string
    ) { }
}