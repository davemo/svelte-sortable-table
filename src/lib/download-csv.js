function asNumberIfPossible(value) {
  if(typeof value === 'string') {
    return value.replace(/,/g, '')
  }
  return value;
}

export function downloadCSV(data, anchor) {
  let headers = Object.keys(data[0]);
  let rows = data.map(d => {
    return headers.map(h => {
      return asNumberIfPossible(d[h]);
    }).join(",")
  }).join("\n")
  let output = `${headers.join(',')}\n${rows}`
  let blobURL = URL.createObjectURL(new File([output], { type: "text/csv"}))
  anchor.setAttribute("href", blobURL)
  anchor.setAttribute("download", "rushing-statistics.csv")
  anchor.click();
}