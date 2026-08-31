let tokenGetter: (() => Promise<string | undefined>) | undefined;

export function setAccessTokenGetter(getter: () => Promise<string | undefined>): void {
  tokenGetter = getter;
}

export async function getAccessToken(): Promise<string | undefined> {
  if (!tokenGetter) {
    return undefined;
  }
  return tokenGetter();
}
