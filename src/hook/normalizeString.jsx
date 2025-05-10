export const normalizeString = (str) => {
    if (!str) return "";
    return str
        .normalize('NFD')                   // tách dấu ra khỏi chữ
        .replace(/[\u0300-\u036f]/g, '')    // xóa dấu
        .toLowerCase()                      // chuyển về thường
        .replace(/\s+/g, '-')               // thay khoảng trắng = dấu gạch ngang nếu cần
};
