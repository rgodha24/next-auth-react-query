import parseUrl from "next-auth/utils/parse-url";
import { fetchData } from "next-auth/client/_utils";
import type { NextAuthClientConfig } from "next-auth/client/_utils";
import type { GetSessionParams } from "next-auth/react";
import type { Session } from "next-auth";
import { proxyLogger } from "next-auth/utils/logger";
import _logger from "next-auth/utils/logger";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const __NEXTAUTH: NextAuthClientConfig = {
   baseUrl: parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
   basePath: parseUrl(process.env.NEXTAUTH_URL).path,
   baseUrlServer: parseUrl(
      process.env.NEXTAUTH_URL_INTERNAL ??
         process.env.NEXTAUTH_URL ??
         process.env.VERCEL_URL
   ).origin,
   basePathServer: parseUrl(
      process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL
   ).path,
   _lastSync: 0,
   _session: undefined,
   // eslint-disable-next-line @typescript-eslint/no-empty-function
   _getSession: () => {},
};
const logger = proxyLogger(_logger, __NEXTAUTH.basePath);

export const getSession = async (params?: GetSessionParams) =>
   fetchData<Session>("session", __NEXTAUTH, logger, params);

const useSession = (params?: UseSessionParams) => {
   const query = useQuery(["useSession"], {
      queryFn: () => getSession(),
      ...params,
   });

   if (query.isSuccess) {
      if (query.data === null)
         return {
            status: "unauthenticated" as const,
            data: null,
            reactQueryData: { ...query },
         };
      return {
         status: "authenticated" as const,
         data: query.data,
         reactQueryData: { ...query },
      };
   }
   return { status: "loading" as const, data: null, reactQueryData: { ...query } };
};

export type UseSessionParams = Omit<
   UseQueryOptions<
      Session | null | undefined,
      unknown,
      Session | null | undefined,
      string[]
   >, 
   "queryFn"
>;
export default useSession;
