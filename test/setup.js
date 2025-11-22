import "@testing-library/jest-dom";

// mock de Audio
class AudioMock {
  play() {}
  pause() {}
}
global.Audio = AudioMock;

// mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);
