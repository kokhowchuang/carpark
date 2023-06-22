exports.getCategory = (count) => {
  if (count >= 100 && count < 300) return 'medium';
  if (count >= 300 && count < 400) return 'big';
  if (count >= 400) return 'large';

  return 'small';
};
