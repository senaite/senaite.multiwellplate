document.addEventListener("DOMContentLoaded", () => {
    const tbody = document
            .querySelector("tbody[data-name_prefix='form.widgets.fields']");
    if (tbody) {
        for (let i = 0; i < 6; i++) {
            const tr = tbody.querySelector(`tr[data-index='${i}']`);
            if (tr) {
                tr.querySelector("button.dgf--row-add").remove();
                tr.querySelector("button.dgf--row-delete").remove();
            }
        }
    }
});
