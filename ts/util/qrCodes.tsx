import { createRoot, Root } from 'react-dom/client';
import { HE4SQRCode, HE4SQRCodeProps } from '../components/HE4SQRCode';
import { convertIconToImageURL } from '../hooks/useIconToImageURL';
import { UserUtils } from '../he4s/utils';
import { sleepFor } from '../he4s/utils/Promise';
import { LightBoxOptions } from '../state/ducks/modalDialog';

export function prepareQRCodeForLightBox(fileName: string, url: string, onClose?: () => void) {
  const attachment = {
    fileName,
    url,
    fileSize: '',
    path: url,
    id: 0,
    contentType: 'image/jpeg',
    screenshot: null,
    thumbnail: null,
  };
  const lightBoxOptions: LightBoxOptions = {
    media: [
      {
        index: 0,
        objectURL: url,
        contentType: 'image/jpeg',
        attachment,
        messageSender: UserUtils.getOurPubKeyStrFromCache(),
        messageTimestamp: -1,
        messageId: '',
      },
    ],
    attachment,
    onClose,
  };

  return lightBoxOptions;
}

export async function renderQRCode(props: HE4SQRCodeProps, filename: string): Promise<string> {
  let url = '';

  let root: HTMLElement | null = null;
  let divElement: HTMLDivElement | null = null;
  let reactRoot: Root | null = null;

  try {
    root = document.querySelector('#root');
    divElement = document.createElement('div');
    divElement.style.display = 'none';
    root?.appendChild(divElement);

    let logoImage = props.logoImage;

    if (props.hasLogo) {
      const { dataUrl } = await convertIconToImageURL(props.hasLogo);
      logoImage = dataUrl;
    }

    reactRoot = createRoot(divElement!);
    reactRoot.render(
      <HE4SQRCode
        id={props.id}
        value={props.value}
        size={props.size}
        hasLogo={props.hasLogo}
        logoImage={logoImage}
        logoSize={props.logoSize}
      />
    );
    // wait for it to render
    await sleepFor(100);

    const qrCanvas = root?.querySelector(`#${props.id}-canvas`);
    if (qrCanvas) {
      url = (qrCanvas as HTMLCanvasElement).toDataURL('image/jpeg');
    } else {
      throw Error('QR Code canvas not found');
    }
  } catch (err) {
    window.log.error(`[saveBWQRCode] failed for ${filename}`, err);
  } finally {
    if (reactRoot) {
      reactRoot?.unmount();
    }
    if (divElement) {
      root?.removeChild(divElement);
    }
  }

  return url;
}
