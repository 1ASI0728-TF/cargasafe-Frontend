export function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toPromise<T>(observable$: import('rxjs').Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const subscription = observable$.subscribe({
      next: (value) => {
        resolve(value);
        subscription.unsubscribe();
      },
      error: (err) => {
        reject(err);
        subscription.unsubscribe();
      },
    });
  });
}
