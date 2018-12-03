export abstract class PageableListComponent {
  page = 1;
  pageSize = 10;

  abstract doList(options: any);

  list() {
    let options: any = {limit: this.pageSize};
    if (this.page > 1) {
      options.from = (this.page - 1) * this.pageSize + 1;
    }
    this.doList(options);
  }

  nextPage() {
    this.page++;
    this.list();
  }

  previousPage() {
    if (this.page == 1) {
      return;
    }
    this.page--;
    this.list();
  }

}
