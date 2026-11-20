const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function positiveInteger(value, maximum = 4294967295) {
  return Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= maximum;
}

export function validEmail(value) {
  return typeof value === "string" && value.trim().length <= 150 && emailRegex.test(value.trim());
}

export function validCpf(value) {
  if (typeof value !== "string") return false;
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

  for (let checkIndex = 9; checkIndex < 11; checkIndex++) {
    let sum = 0;
    for (let i = 0; i < checkIndex; i++) sum += Number(cpf[i]) * (checkIndex + 1 - i);
    const remainder = (sum * 10) % 11;
    const digit = remainder === 10 ? 0 : remainder;
    if (digit !== Number(cpf[checkIndex])) return false;
  }
  return true;
}

export function normalizeCpf(value) {
  return String(value).replace(/\D/g, "");
}

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateDonorInput({ nome, cpf, email, telefone, ativo }, requireAtivo = false) {
  if (typeof nome !== "string" || !nome.trim()) return "Nome é obrigatório.";
  if (nome.trim().length > 150) return "Nome deve ter até 150 caracteres.";
  if (!validCpf(cpf) || String(cpf).replace(/\D/g, "").length !== 11) return "CPF inválido.";
  if (!validEmail(email)) return "E-mail inválido.";
  if (telefone !== undefined && (typeof telefone !== "string" || telefone.trim().length > 30)) {
    return "Telefone deve ser texto com até 30 caracteres.";
  }
  if (requireAtivo && typeof ativo !== "boolean") {
    return "Ativo deve ser verdadeiro ou falso.";
  }
  if (!requireAtivo && ativo !== undefined && typeof ativo !== "boolean") {
    return "Ativo deve ser verdadeiro ou falso.";
  }
  return null;
}

export function validateDonationInput({ id_doador, data_doacao, descricao, itens }) {
  if (!positiveInteger(id_doador)) return "Doador inválido.";
  if (!validDate(data_doacao)) return "Data da doação inválida.";
  if (typeof descricao !== "string" || !descricao.trim()) return "Descrição é obrigatória.";
  if (descricao.trim().length > 65535) return "Descrição deve ter até 65.535 caracteres.";
  if (!Array.isArray(itens) || itens.length === 0) return "Informe ao menos um item.";
  if (itens.length > 1000) return "Uma doação pode conter até 1.000 itens diferentes.";

  const itemIds = new Set();
  for (const item of itens) {
    if (!item || !positiveInteger(item.id_item)) return "Identificador de item inválido.";
    if (
      !positiveInteger(item.quantidade, 4294967295) ||
      !Number.isInteger(Number(item.quantidade)) ||
      Number(item.quantidade) < 1
    ) {
      return "Quantidade deve ser um número inteiro maior que zero.";
    }
    if (itemIds.has(Number(item.id_item))) return "Não informe itens repetidos na mesma doação.";
    itemIds.add(Number(item.id_item));
  }
  return null;
}
