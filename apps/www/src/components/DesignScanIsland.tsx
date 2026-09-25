/**
 * El punto de entrada de la isla.
 *
 * Existe solo para que la red de seguridad envuelva a la herramienta DENTRO de
 * React: una isla `client:only` no puede recibir un componente React como hijo
 * desde Astro, así que el envoltorio tiene que armarse aquí.
 */

import DesignScan, { type DesignScanCopy } from "@components/DesignScan";
import DesignScanBoundary from "@components/DesignScanBoundary";

type Props = {
  copy: DesignScanCopy;
  siteOrigin: string;
};

export default function DesignScanIsland({ copy, siteOrigin }: Props) {
  return (
    <DesignScanBoundary>
      <DesignScan copy={copy} siteOrigin={siteOrigin} />
    </DesignScanBoundary>
  );
}
