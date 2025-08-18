{
  buildNpmPackage,
  importNpmLock,
  name,
  version,
  lib,
}:
buildNpmPackage {
  inherit version;
  pname = name;

  src = lib.cleanSource ../.;

  npmDeps = importNpmLock {
    npmRoot = lib.cleanSource ../.;
  };

  npmConfigHook = importNpmLock.npmConfigHook;

  installPhase = ''
    cp -r dist $out
  '';
}
