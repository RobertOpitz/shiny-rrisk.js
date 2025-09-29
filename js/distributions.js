export function unif(min = 0, max = 1) {
    return (max - min) * Math.random() + min;
}

export function norm(mu = 0, sd = 1) {
    let r1, r2, rsq;

    do {
        r1  = 2.0 * Math.random() - 1.0;
        r2  = 2.0 * Math.random() - 1.0;
        rsq = r1**2 + r2**2;
    } while(rsq === 0.0 || rsq > 1.0);

    rsq = Math.sqrt(-2.0 * Math.log(rsq)/rsq);

    return sd * r1 * rsq + mu;
} 