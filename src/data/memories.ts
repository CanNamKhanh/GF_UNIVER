export interface Memory {
  id: string;
  title: string;
  /** ISO date: YYYY-MM-DD */
  date: string;
  description: string;
  imageUrl: string;
}

/** Payload for creating or updating a memory (the id is assigned by the store). */
export type MemoryInput = Omit<Memory, 'id'>;

/**
 * Placeholder photos from picsum.photos (CORS-friendly, required for WebGL textures).
 * Replace `imageUrl` with your own files in /public (e.g. "/photos/01.jpg")
 * or any host that sends `Access-Control-Allow-Origin`.
 * Portrait 3:4 images look best inside the frames.
 */
const photo = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/900/1200`;

export const memories: Memory[] = [
  {
    id: 'm1',
    title: 'Lần đầu gặp nhau',
    date: '2023-03-14',
    description:
      'Hôm đó trời mưa nhẹ, và anh/em đã không biết rằng cả vũ trụ đang bắt đầu xoay quanh một cuộc gặp tình cờ.',
    imageUrl: photo('universe-first-meet'),
  },
  {
    id: 'm2',
    title: 'Chuyến đi biển đầu tiên',
    date: '2023-06-02',
    description:
      'Gió, cát và tiếng cười. Mọi thứ đều bình thường, trừ việc có em ở đó.',
    imageUrl: photo('universe-beach'),
  },
  {
    id: 'm3',
    title: 'Sinh nhật ngọt ngào',
    date: '2023-09-21',
    description:
      'Một chiếc bánh nhỏ, một ngọn nến, và một điều ước mà ai cũng biết là gì.',
    imageUrl: photo('universe-birthday'),
  },
  {
    id: 'm4',
    title: 'Hoàng hôn trên đồi',
    date: '2023-12-24',
    description:
      'Chúng ta ngồi im lặng nhìn mặt trời lặn, và im lặng ấy là điều đẹp nhất.',
    imageUrl: photo('universe-sunset'),
  },
  {
    id: 'm5',
    title: 'Mùa đông cùng nhau',
    date: '2024-01-28',
    description:
      'Hai cốc cacao nóng, một chiếc khăn quàng chung, và cái lạnh không còn đáng sợ.',
    imageUrl: photo('universe-winter'),
  },
  {
    id: 'm6',
    title: 'Chuyến phiêu lưu bất ngờ',
    date: '2024-05-11',
    description:
      'Lạc đường một chút, nhưng lại tìm thấy quán cà phê nhỏ đẹp nhất thế giới.',
    imageUrl: photo('universe-adventure'),
  },
  {
    id: 'm7',
    title: 'Ngày mình về chung một nhà',
    date: '2024-08-09',
    description:
      'Những chiếc hộp chưa mở hết, nhưng căn phòng đã đầy ắp tiếng cười.',
    imageUrl: photo('universe-home'),
  },
  {
    id: 'm8',
    title: '20/10 của riêng em',
    date: '2024-10-20',
    description:
      'Cảm ơn em đã là vũ trụ của anh. Mọi vì sao đều mờ đi khi em mỉm cười.',
    imageUrl: photo('universe-2010'),
  },
];
