const GithubClient = require('./github');

const {
  TEST_GITHUB_TOKEN: TOKEN,
  TEST_GITHUB_REPO: REPO,
  TEST_GITHUB_SHA: SHA
} = process.env;

describe('Non Enviromental tests', () => {
  const client = new GithubClient({ repo: REPO, token: TOKEN });

  test('test repo and token', async () => {
    expect(client.repo).toBe(REPO);
    expect(client.token).toBe(TOKEN);

    const { owner, repo } = client.ownerRepo();
    const parts = REPO.split('/');
    expect(owner).toBe(parts[parts.length - 2]);
    expect(repo).toBe(parts[parts.length - 1]);
  });

  test('Comment', async () => {
    const report = '## Test comment';
    const commitSha = SHA;
    const url = await client.commentCreate({ report, commitSha });

    expect(url.startsWith('https://')).toBe(true);
  });

  test('Publish', async () => {
    await expect(client.upload()).rejects.toThrow(
      'Github does not support publish!'
    );
  });

  test('Runner token', async () => {
    const output = await client.runnerToken();
    expect(output.length).toBe(29);
  });

  test('updateGitConfig', async () => {
    const client = new GithubClient({
      repo: 'https://github.com/test/test',
      token: 'dXNlcjpwYXNz'
    });
    const command = await client.updateGitConfig();
    expect(command).toMatchInlineSnapshot(`
      "
          git config --unset http.https://github.com/.extraheader && \\\\
          git config user.name \\"GitHub Action\\" && \\\\
          git config user.email \\"action@github.com\\" && \\\\
          git remote set-url origin \\"https://GitHub%20Action:dXNlcjpwYXNz@github.com/test/test.git\\""
    `);
  });

  test('Check pinned version of Octokit', async () => {
    // This test is a must to ensure that @actions/github is not updated.
    // There is a bug that after a reRunWorkflow deprecation rest the library does not contains
    // nor the original reRunWorkflow nor the new one!

    const { dependencies } = require('../../package.json');
    expect(dependencies['@actions/github']).toBe('^4.0.0');
    expect(dependencies['@octokit/rest']).toBe('18.0.0');
    expect(dependencies['@octokit/core']).toBe('^3.5.1');
  });
});
