#!/usr/bin/env python3
"""Converte base_produtos.xlsx em dados_produtos.json para o GitHub Pages."""
import json
import math
import sys
from datetime import date, datetime, time
from pathlib import Path

from openpyxl import load_workbook

PASTA = Path(__file__).resolve().parent
ARQUIVO_EXCEL = PASTA / "base_produtos.xlsx"
ARQUIVO_JSON = PASTA / "dados_produtos.json"


def normalizar(valor):
    if valor is None:
        return None
    if isinstance(valor, (datetime, date, time)):
        return valor.isoformat()
    if isinstance(valor, float) and not math.isfinite(valor):
        return None
    return valor


def main():
    if not ARQUIVO_EXCEL.exists():
        raise FileNotFoundError(
            f"Não encontrei {ARQUIVO_EXCEL.name} na pasta {PASTA.name}."
        )

    workbook = load_workbook(ARQUIVO_EXCEL, read_only=True, data_only=True)
    try:
        worksheet = next(
            (sheet for sheet in workbook.worksheets if sheet.max_row and sheet.max_column),
            None,
        )
        if worksheet is None:
            raise ValueError("A planilha está vazia.")

        rows = worksheet.iter_rows(values_only=True)
        try:
            headers = [str(value).strip() if value is not None else "" for value in next(rows)]
        except StopIteration:
            raise ValueError("A planilha está vazia.")

        while headers and not headers[-1]:
            headers.pop()
        if not headers or any(not header for header in headers):
            raise ValueError("Há cabeçalho vazio na primeira linha da planilha.")
        if len(set(headers)) != len(headers):
            raise ValueError("Há nomes de coluna repetidos na primeira linha da planilha.")

        records = []
        for row in rows:
            values = list(row[:len(headers)])
            values.extend([None] * (len(headers) - len(values)))
            if not any(value is not None and str(value).strip() for value in values):
                continue
            records.append({header: normalizar(value) for header, value in zip(headers, values)})

        if not records:
            raise ValueError("Nenhum registro foi encontrado; o JSON anterior foi preservado.")

        temporary = ARQUIVO_JSON.with_name(ARQUIVO_JSON.name + ".tmp")
        temporary.write_text(
            json.dumps(records, ensure_ascii=False, indent=2, allow_nan=False),
            encoding="utf-8",
        )
        json.loads(temporary.read_text(encoding="utf-8"))
        temporary.replace(ARQUIVO_JSON)
        print(f"Concluído: {len(records):,} registros exportados para {ARQUIVO_JSON.name}.".replace(",", "."))
    finally:
        workbook.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"ERRO: {error}", file=sys.stderr)
        sys.exit(1)
