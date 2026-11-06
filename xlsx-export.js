/* Small dependency-free XLSX writer for the dashboard exports. */
(function (global) {
  const encoder = new TextEncoder();
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
  const crc32 = bytes => { let c = 0xffffffff; for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const xml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const u16 = (v, o) => { const a = new Uint8Array(2); new DataView(a.buffer).setUint16(0, v, true); return a; };
  const u32 = (v, o) => { const a = new Uint8Array(4); new DataView(a.buffer).setUint32(0, v >>> 0, true); return a; };
  const join = chunks => { const out = new Uint8Array(chunks.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of chunks) { out.set(x, p); p += x.length; } return out; };
  function zip(files) {
    const local = [], central = []; let offset = 0;
    for (const [name, content] of Object.entries(files)) {
      const filename = encoder.encode(name), data = encoder.encode(content), crc = crc32(data);
      const lh = join([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(filename.length),u16(0),filename]);
      local.push(lh, data);
      const ch = join([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(filename.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),filename]);
      central.push(ch); offset += lh.length + data.length;
    }
    const directory = join(central), end = join([u32(0x06054b50),u16(0),u16(0),u16(central.length),u16(central.length),u32(directory.length),u32(offset),u16(0)]);
    return join([...local, directory, end]);
  }
  function excelDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
    const s = String(value ?? '').trim(); let m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
    if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  function createXlsx(headers, rows, filename) {
    const cols = headers.length, last = n => { let s = ''; for (n++; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
    const sheetRows = [headers, ...rows].map((row, ri) => '<row r="' + (ri + 1) + '">' + row.map((cell, ci) => {
      const ref = last(ci) + (ri + 1), value = ri === 0 ? cell.value : cell;
      if (ri === 0) return `<c r="${ref}" t="inlineStr" s="1"><is><t>${xml(value)}</t></is></c>`;
      if (value === null || value === undefined || value === '') return `<c r="${ref}"/>`;
      const type = headers[ci].type || 'text';
      if (type === 'money' || type === 'number') { const num = Number(value); if (Number.isFinite(num)) return `<c r="${ref}"${type === 'money' ? ' s="2"' : ''}><v>${type === 'money' ? num.toFixed(2) : String(num)}</v></c>`; }
      if (type === 'date') { const date = excelDate(value); if (date !== null) return `<c r="${ref}" s="3"><v>${date / 86400000 + 25569}</v></c>`; }
      return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
    }).join('') + '</row>').join('');
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${headers.map((h,i)=>`<col min="${i+1}" max="${i+1}" width="${h.type==='text'?24:h.type==='date'?14:18}" customWidth="1"/>`).join('')}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${last(cols-1)}${rows.length+1}"/></worksheet>`;
    const files = {
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2457D6"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>',
      'xl/worksheets/sheet1.xml': sheet
    };
    const blob = new Blob([zip(files)], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  global.createXlsx = createXlsx;
})(window);
