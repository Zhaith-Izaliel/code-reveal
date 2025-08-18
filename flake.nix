{
  description = "An opinionated bootstrapper to create an Electron application with first class Vue/Typescript support, validated by ESLint.";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs = inputs @ {flake-parts, ...}: let
    inherit (packageJson) version name;
    packageJson = builtins.fromJSON (builtins.readFile ./package.json);
  in
    flake-parts.lib.mkFlake {inherit inputs;} ({...}: {
      systems = ["x86_64-linux" "aarch64-darwin" "x86_64-darwin"];

      perSystem = {pkgs, ...}: {
        devShells = {
          # nix develop
          default = let
            electron = pkgs.electron_37;
          in
            pkgs.mkShell {
              ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
              ELECTRON_EXEC_PATH = "${electron}/bin/electron";

              nativeBuildInputs =
                (with pkgs; [
                  nodePackages.prettier
                  nodePackages.typescript-language-server
                  nodejs_22
                ])
                ++ [electron];
            };
        };

        packages = {
          default = pkgs.callPackage ./nix {inherit version name;};
        };
      };
    });
}
