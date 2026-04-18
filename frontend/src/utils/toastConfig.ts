import { toast } from 'react-hot-toast';

let activeToasts: string[] = [];

export const smartToast = Object.assign(
    (message: string) => {
        if (activeToasts.length >= 2) {
            toast.dismiss(activeToasts[0]);
            activeToasts.shift();
        }
        const id = toast.success(message);
        activeToasts.push(id);
        return id;
    },
    {
        success: (message: string) => {
            if (activeToasts.length >= 2) {
                toast.dismiss(activeToasts[0]);
                activeToasts.shift();
            }
            const id = toast.success(message);
            activeToasts.push(id);
            return id;
        },
        error: (message: string) => {
            if (activeToasts.length >= 2) {
                toast.dismiss(activeToasts[0]);
                activeToasts.shift();
            }
            const id = toast.error(message);
            activeToasts.push(id);
            return id;
        }
    }
);
