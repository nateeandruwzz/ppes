export function zodToError(zodError) {
    const errors = {}
    for (const issue of zodError.issues) {
        const key = issue.path?.[0];
        if (!key) continue;
        if (!errors[key]) errors[key] = issue.message;
    }

    return errors
}