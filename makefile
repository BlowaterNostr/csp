coverage_dir = cov_profile

test: clear-coverage
	deno test --coverage=$(coverage_dir)

fmt:
	deno fmt --options-indent-width 4 --options-line-width 130

cov:
	deno coverage cov_profile --lcov --output=cov_profile.lcov
	genhtml --ignore-errors unmapped -o cov_profile/html cov_profile.lcov
	file_server -p 4508 cov_profile/html

clear-coverage:
	rm -rf $(coverage_dir)

publish: # to npm
	cp csp.ts nodejs/csp.ts
	cd nodejs && npx tsc --lib ESNext,DOM csp.ts
	cd nodejs && mv csp.js common.js
