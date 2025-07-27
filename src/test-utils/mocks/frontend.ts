// Frontend-specific mocks for browser APIs

export const clipboardMock = {
  writeText: jest.fn(),
  readText: jest.fn(),
};

export const setupClipboardMock = () => {
  Object.assign(navigator, {
    clipboard: clipboardMock,
  });
  return clipboardMock;
};

export const mockClipboardSuccess = () => {
  clipboardMock.writeText.mockResolvedValue(undefined);
  clipboardMock.readText.mockResolvedValue('test text');
};

export const mockClipboardError = (
  error: Error = new Error('Clipboard failed')
) => {
  clipboardMock.writeText.mockRejectedValue(error);
  clipboardMock.readText.mockRejectedValue(error);
};
