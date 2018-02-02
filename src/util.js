export const formatListOfNames = names => {
  if (names.length < 3) {
    return names.join(' and ')
  }

  const commaNames = names.slice(0, names.length - 1).join(', ')
  const finalName = names[names.length - 1]

  return `${commaNames}, and ${finalName}`
}
