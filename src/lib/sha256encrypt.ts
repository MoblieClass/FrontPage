import {SHA256} from 'crypto-js';

export function sha256encrypt(e: string):string {
    return SHA256(e).toString();
}
