import { Injectable } from '@nestjs/common';

@Injectable()
export class RepositoriesService {
  /**
   * TODO: GitHub REST API를 호출해 사용자의 레포지토리 목록을 가져온다.
   */
  async listRepositories(accessToken: string) {
    void accessToken;
    return [];
  }

  /**
   * TODO: GitHub REST API를 호출해 두 브랜치 간 diff를 가져온다.
   */
  async getBranchDiff(owner: string, repo: string, base: string, head: string) {
    void owner;
    void repo;
    void base;
    void head;
    return '';
  }
}
