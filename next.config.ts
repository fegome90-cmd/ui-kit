import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // La raíz lleva al banco. En config y no con redirect() en una página: así no hay
  // segmento que prerenderizar ni el aviso de validación de cacheComponents.
  redirects() {
    return [{ source: "/", destination: "/componentes", permanent: false }];
  },
};

export default nextConfig;
