import QRCode from 'qrcode';

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function buildPromptPayPayload(target: string, amount?: number): string {
  const sanitized = target.replace(/[^0-9]/g, '');
  let formattedTarget = '';

  if (sanitized.length >= 13) {
    // National ID / Tax ID (13 digits)
    formattedTarget = tlv('02', sanitized.slice(0, 13));
  } else {
    // Mobile phone number -> 0066xxxxxxxxx
    const normalized = sanitized.startsWith('0')
      ? `0066${sanitized.slice(1)}`
      : sanitized.startsWith('66')
      ? `00${sanitized}`
      : `0066${sanitized}`;
    formattedTarget = tlv('01', normalized);
  }

  const merchantInfo = tlv('00', 'A000000677010111') + formattedTarget;

  const segments = [
    tlv('00', '01'), // Payload Format Indicator
    tlv('01', amount && amount > 0 ? '12' : '11'), // Dynamic vs Static
    tlv('29', merchantInfo),
    tlv('53', '764'), // THB Currency Code
  ];

  if (amount && amount > 0) {
    segments.push(tlv('54', amount.toFixed(2)));
  }

  segments.push(tlv('58', 'TH'));
  const rawWithoutCrc = `${segments.join('')}6304`;
  return `${rawWithoutCrc}${crc16(rawWithoutCrc)}`;
}

export async function generatePromptPayQrDataUrl(
  target: string,
  amount?: number
): Promise<{ payload: string; qrDataUrl: string }> {
  const payload = buildPromptPayPayload(target, amount);
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 320,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
  return { payload, qrDataUrl };
}
