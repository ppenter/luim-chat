"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecoilState } from "recoil";
import {
  functionsContextAtom,
  installedPluginsAtom,
  openaiSettingAtom,
  pluginsAtom,
} from "../../../states/atom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ExclamationTriangleIcon,
  EyeNoneIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { extract_form_data } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { decode, encode } from "@/lib/encoded";

export default function Settings() {
  const [openaiSetting, setOpenAiSetting] = useRecoilState(openaiSettingAtom);
  const [openaiSettingForm, setOpenAiSettingForm] = useState(openaiSetting);
  const [plugins, setPlugins] = useRecoilState(pluginsAtom);

  const [mounted, setMounted] = useState(false);

  const [installedPlugins, setInstalledPlugins] =
    useRecoilState(installedPluginsAtom);

  const [hidden, setHidden] = useState({
    openai_api: true,
  });

  const onOpenaiSubmit = (e: any) => {
    e.preventDefault();
    const data = extract_form_data(e.target);
    setOpenAiSetting(data);
  };

  const [functionsContext, setFunctionsContext] =
    useRecoilState(functionsContextAtom);

  console.log(functionsContext);
  const fetchFunctionsContext = async () => {
    const functions = await Promise.all(
      installedPlugins.map(async (plugin) => {
        if (!plugin?.isActive) return [];
        const res = await fetch(`/plugins/${plugin.name}.json`);
        const json = await res.json();
        const apis = json.api.map((api: any) => {
          return {
            ...api,
            name: `${plugin.name}___${api.name}`,
          };
        });
        return apis;
      }),
    );
    setFunctionsContext(functions.flat());
  };

  const fetchPlugins = async () => {
    const res = await fetch("/plugins/index.json");
    const json = await res.json();
    const keys = Object.keys(json);
    const _plugins = keys.map((key) => {
      return {
        ...json[key],
        name: key,
      };
    });
    setPlugins(_plugins);
  };

  useEffect(() => {
    fetchPlugins();
    fetchFunctionsContext();
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpenAiSettingForm(openaiSetting);
  }, [openaiSetting]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-2xl font-bold">Settings</p>
          <p>These are your settings.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              const password = prompt("Enter encrypt password");
              if (!password) return;
              const res = encode(
                JSON.stringify({
                  openaiSetting,
                  installedPlugins,
                }),
                password,
              );
              const blob = new Blob([res], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              let a = document.createElement("a");
              const rand_filename =
                "luim_settings_" + Math.random().toString(36).substring(7);
              a.href = url;
              a.download = rand_filename;
              a.click();
            }}
          >
            Export
          </Button>
          <Button
            onClick={async () => {
              const file = document.createElement("input");
              file.type = "file";
              file.onchange = async (e) => {
                const files = (e.target as any).files;
                if (!files) return;
                const file = files[0];
                const reader = new FileReader();
                reader.onload = async (e) => {
                  const password = prompt("Enter decrypt password");
                  if (!password) return;
                  const res = decode(e.target?.result as string, password);
                  const data = JSON.parse(res);
                  setOpenAiSetting(data.openaiSetting);
                  setInstalledPlugins(data.installedPlugins);
                  fetchFunctionsContext();
                };
                reader.readAsText(file);
              };
              file.click();
            }}
          >
            Import
          </Button>
        </div>
      </div>
      <Separator className="mt-2" />

      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Alert</AlertTitle>
        <AlertDescription>
          This application is under development. These settings are store
          directly in your browser. Do not share computer with other people.
        </AlertDescription>
      </Alert>
      <div className="rounded-xl border">
        <p className="w-full items-center rounded-t-xl bg-zinc-100 px-4 py-2 text-xl font-bold dark:bg-zinc-900">
          OpenAI
        </p>
        <form onSubmit={onOpenaiSubmit} className="flex flex-col gap-2 p-4">
          OPENAI_API_KEY
          <div className="flex items-center gap-2">
            <Input
              value={openaiSettingForm?.apiKey}
              onChange={(e) => {
                setOpenAiSettingForm({
                  ...openaiSettingForm,
                  apiKey: e.target.value,
                });
              }}
              name="apiKey"
              type={hidden?.openai_api ? "password" : "text"}
            />
            <Button
              variant="ghost"
              onClick={() => {
                setHidden({
                  ...hidden,
                  openai_api: !hidden.openai_api,
                });
              }}
            >
              {hidden?.openai_api ? <EyeOpenIcon /> : <EyeNoneIcon />}
            </Button>
          </div>
          <div className="flex w-full justify-end">
            <Button
              type="submit"
              disabled={
                JSON.stringify(openaiSetting) ===
                JSON.stringify(openaiSettingForm)
              }
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <div className="rounded-xl border">
        <div className="flex items-center justify-between rounded-t-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-900">
          <p className="text-xl font-bold">Plugins</p>
          <div>
            <Dialog>
              <DialogTrigger>
                <Plus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Install Plugins</DialogTitle>
                  <DialogDescription>
                    Select plugins to install
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  {plugins?.map((plugin: any) => {
                    if (installedPlugins?.find((p) => p.name == plugin.name))
                      return null;
                    return (
                      <div
                        key={plugin?.name}
                        className="flex w-full justify-between"
                      >
                        <div>{plugin?.title}</div>
                        <div>
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              const data = await fetch(
                                `/plugins/${plugin.name}.json`,
                              );
                              const manifest = await data.json();

                              setInstalledPlugins([
                                ...installedPlugins,
                                {
                                  name: plugin.name,
                                  isActive: false,
                                  url: manifest?.host || undefined,
                                  authorization: manifest?.auth
                                    ? ""
                                    : undefined,
                                },
                              ]);
                            }}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-4">
          {installedPlugins?.map((plugin: any) => {
            return (
              <Accordion key={plugin?.name} type="single" collapsible>
                <AccordionItem value={plugin?.name}>
                  <AccordionTrigger>
                    <div className="flex w-full justify-between">
                      <div>
                        {
                          plugins?.find((p: any) => p.name == plugin.name)
                            ?.title
                        }
                      </div>
                      <div>
                        <Switch
                          checked={plugin?.isActive}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onCheckedChange={(e) => {
                            setInstalledPlugins(
                              installedPlugins.map((p) => {
                                if (p.name == plugin.name) {
                                  return {
                                    ...p,
                                    isActive: e,
                                  };
                                }
                                return p;
                              }),
                            );
                          }}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex w-full gap-2">
                      {!plugin?.host && (
                        <Label className="flex flex-1 flex-col gap-4">
                          Host
                          <Input
                            value={plugin?.url}
                            name="plugin_host"
                            onChange={(e) => {
                              setInstalledPlugins(
                                installedPlugins.map((p) => {
                                  if (p.name == plugin.name) {
                                    return {
                                      ...p,
                                      url: e.target.value || undefined,
                                    };
                                  }
                                  return p;
                                }),
                              );
                            }}
                          />
                        </Label>
                      )}

                      {plugin?.authorization !== undefined && (
                        <Label className="flex flex-1 flex-col gap-4">
                          Autorization
                          <Input
                            type="password"
                            value={plugin?.authorization}
                            name="plugin_authorization"
                            onChange={(e) => {
                              setInstalledPlugins(
                                installedPlugins.map((p) => {
                                  if (p.name == plugin.name) {
                                    return {
                                      ...p,
                                      authorization: e.target.value,
                                    };
                                  }
                                  return p;
                                }),
                              );
                            }}
                          />
                        </Label>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const res = confirm(
                            "Are you sure to uninstall this plugin?",
                          );
                          if (res) {
                            setInstalledPlugins(
                              installedPlugins.filter(
                                (p) => p.name != plugin.name,
                              ),
                            );
                          }
                        }}
                      >
                        Uninstall
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </div>
      </div>
    </div>
  );
}
