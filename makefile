coverage_dir = cov_profile

test: clear-coverage
	deno test --coverage=$(coverage_dir)

fmt:
	deno fmt

cov:
	deno coverage cov_profile --lcov --output=cov_profile.lcov
	genhtml --ignore-errors unmapped -o cov_profile/html cov_profile.lcov
	file_server -p 4508 cov_profile/html

clear-coverage:
	rm -rf $(coverage_dir)
