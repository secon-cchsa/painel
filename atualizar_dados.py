#!/usr/bin/env python3
"""Converte base_contratacoes.xlsx em dados.json para publicação no GitHub Pages."""
import json, math, re, sys
from pathlib import Path
from openpyxl import load_workbook

PASTA = Path(__file__).resolve().parent
ARQUIVO_EXCEL = PASTA / "base_contratacoes.xlsx"
ARQUIVO_JSON = PASTA / "dados.json"
COLUNAS = {
    "modalidade": ["Modalidade", "modalidade"],
    "numero": ["Número", "Numero", "número", "numero"],
    "ano": ["Ano", "ano"],
    "descricao": ["Descrição", "Descricao", "descrição", "descricao"],
    "fornecedor": ["Nome do fornecedor", "fornecedor", "Fornecedor"],
    "cnpj": ["CNPJ", "cnpj"],
    "estado": ["Estado (UF)", "estado", "UF", "Estado"],
    "planejado": ["Valor planejado", "planejado", "Valor Planejado"],
    "empenho": ["Número da nota de empenho", "empenho", "Nota de empenho"],
    "empenhado": ["Valor empenhado", "empenhado", "Valor Empenhado"],
    "dataEmpenho": ["Data do empenho", "dataEmpenho", "Data de Empenho"],
    "notaFiscal": ["Número da nota fiscal", "notaFiscal", "Nota fiscal"],
    "notaFiscalValor": ["Valor da nota fiscal", "notaFiscalValor", "Valor da Nota Fiscal"],
    "dataNota": ["Data de emissão da nota fiscal", "dataNota", "Data de Emissão da Nota Fiscal"],
}
NUMERICAS = {"planejado", "empenhado", "notaFiscalValor"}
def texto(v):
    if v is None: return ""
    if hasattr(v, "strftime"): return v.strftime("%d/%m/%Y")
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    return str(v).strip()
def numero(v, campo, linha):
    if v is None or v == "": return 0
    if isinstance(v, (int,float)): n=float(v)
    else:
        t=str(v).strip().replace("R$", "").replace(" ", "")
        if "," in t: t=t.replace(".", "").replace(",", ".")
        try: n=float(t)
        except ValueError: raise ValueError(f"Linha {linha}: valor inválido em {campo}: {v!r}")
    if not math.isfinite(n): raise ValueError(f"Linha {linha}: número inválido em {campo}")
    return n
def main():
    if not ARQUIVO_EXCEL.exists(): raise FileNotFoundError(f"Não encontrei {ARQUIVO_EXCEL.name} na pasta do projeto.")
    wb=load_workbook(ARQUIVO_EXCEL, read_only=True, data_only=True)
    ws=wb["Contratacoes"] if "Contratacoes" in wb.sheetnames else wb.active
    rows=ws.iter_rows(values_only=True)
    try: headers=[texto(x) for x in next(rows)]
    except StopIteration: raise ValueError("A planilha está vazia.")
    indexes={}
    for campo, aliases in COLUNAS.items():
        found=next((headers.index(a) for a in aliases if a in headers), None)
        if found is None: raise ValueError(f"Não encontrei a coluna {campo}. Confira os cabeçalhos da planilha.")
        indexes[campo]=found
    saida=[]
    for n, row in enumerate(rows, start=2):
        vals={k:(row[i] if i < len(row) else None) for k,i in indexes.items()}
        if not any(v is not None and str(v).strip() for v in vals.values()): continue
        reg={}
        for campo,v in vals.items():
            if campo in NUMERICAS: reg[campo]=numero(v,campo,n)
            else: reg[campo]=texto(v)
        reg["modalidade"]=reg["modalidade"].strip().title()
        if reg["modalidade"] not in ("Pregão","Irp"):
            raise ValueError(f"Linha {n}: modalidade deve ser Pregão ou IRP.")
        if reg["modalidade"] == "Irp": reg["modalidade"]="IRP"
        reg["ano"]=reg["ano"].strip()
        reg["estado"]=reg["estado"].upper()
        saida.append(reg)
    if not saida: raise ValueError("Nenhum registro foi encontrado; o JSON anterior foi preservado.")
    temporario=ARQUIVO_JSON.with_suffix(".json.tmp")
    temporario.write_text(json.dumps(saida,ensure_ascii=False,indent=2),encoding="utf-8")
    json.loads(temporario.read_text(encoding="utf-8")); temporario.replace(ARQUIVO_JSON)
    print(f"Concluído: {len(saida):,} registros exportados para {ARQUIVO_JSON.name}.".replace(",","."))
if __name__ == "__main__":
    try: main()
    except Exception as e: print(f"ERRO: {e}",file=sys.stderr); sys.exit(1)
