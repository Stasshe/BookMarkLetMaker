// Minifyオプション設定UI
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

type MinifyOptions = {
  compress: {
    arrows: boolean;
    booleans: boolean;
    collapse_vars: boolean;
    comparisons: boolean;
    computed_props: boolean;
    conditionals: boolean;
    dead_code: boolean;
    drop_console: boolean;
    drop_debugger: boolean;
    evaluate: boolean;
    hoist_funs: boolean;
    hoist_props: boolean;
    hoist_vars: boolean;
    if_return: boolean;
    inline: boolean;
    join_vars: boolean;
    keep_fargs: boolean;
    keep_fnames: boolean;
    keep_infinity: boolean;
    loops: boolean;
    negate_iife: boolean;
    passes: number;
    properties: boolean;
    reduce_funcs: boolean;
    reduce_vars: boolean;
    sequences: boolean;
    side_effects: boolean;
    switches: boolean;
    toplevel: boolean;
    typeofs: boolean;
    unsafe: boolean;
    unsafe_arrows: boolean;
    unsafe_comps: boolean;
    unsafe_Function: boolean;
    unsafe_math: boolean;
    unsafe_methods: boolean;
    unsafe_proto: boolean;
    unsafe_regexp: boolean;
    unsafe_undefined: boolean;
    unused: boolean;
  };
  mangle: {
    toplevel: boolean;
    properties: boolean;
    keep_classnames: boolean;
    keep_fnames: boolean;
    module: boolean;
    safari10: boolean;
  };
  format: {
    comments: boolean;
    beautify: boolean;
    semicolons: boolean;
  };
  ecma: number;
  toplevel: boolean;
  keep_classnames: boolean;
  keep_fnames: boolean;
};

type MinifyOptionsGridProps = {
  show: boolean;
  setShow: (v: (prev: boolean) => boolean) => void;
  minifyOptions: MinifyOptions;
  handleMinifyOptionChange: (group: string, key: string, value: unknown) => void;
  getDefaultMinifyOptions: () => MinifyOptions;
  setMinifyOptions: (opts: MinifyOptions) => void;
};

export default function MinifyOptionsGrid({
  show,
  setShow,
  minifyOptions,
  handleMinifyOptionChange,
  getDefaultMinifyOptions,
  setMinifyOptions,
}: MinifyOptionsGridProps) {
  return (
    <div className="max-w-6xl mx-auto mt-8 mb-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <button
          className="flex items-center gap-2 text-base font-semibold text-card-foreground mb-4 focus:outline-none hover:underline"
          onClick={() => setShow(v => !v)}
          aria-expanded={show}
          aria-controls="minify-options-panel"
          type="button"
        >
          {show ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
          Minifyオプション詳細設定
        </button>
        {show && (
          <div id="minify-options-panel" className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* compress */}
            <div>
              <div className="font-bold mb-2">compress</div>
              <div className="flex flex-col gap-2">
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.drop_console}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'drop_console', e.target.checked)
                    }
                  />{' '}
                  drop_console
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.drop_debugger}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'drop_debugger', e.target.checked)
                    }
                  />{' '}
                  drop_debugger
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.unsafe}
                    onChange={e => handleMinifyOptionChange('compress', 'unsafe', e.target.checked)}
                  />{' '}
                  unsafe
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.unsafe_arrows}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'unsafe_arrows', e.target.checked)
                    }
                  />{' '}
                  unsafe_arrows
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.unsafe_methods}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'unsafe_methods', e.target.checked)
                    }
                  />{' '}
                  unsafe_methods
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.unsafe_proto}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'unsafe_proto', e.target.checked)
                    }
                  />{' '}
                  unsafe_proto
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.compress.unsafe_undefined}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'unsafe_undefined', e.target.checked)
                    }
                  />{' '}
                  unsafe_undefined
                </label>
                <label>
                  passes
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={minifyOptions.compress.passes}
                    onChange={e =>
                      handleMinifyOptionChange('compress', 'passes', Number(e.target.value))
                    }
                    className="ml-2 w-16 border rounded px-1 py-0.5 text-black bg-white"
                  />
                </label>
              </div>
            </div>
            {/* mangle */}
            <div>
              <div className="font-bold mb-2">mangle</div>
              <div className="flex flex-col gap-2">
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.toplevel}
                    onChange={e => handleMinifyOptionChange('mangle', 'toplevel', e.target.checked)}
                  />{' '}
                  toplevel
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.properties}
                    onChange={e =>
                      handleMinifyOptionChange('mangle', 'properties', e.target.checked)
                    }
                  />{' '}
                  properties
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.keep_classnames}
                    onChange={e =>
                      handleMinifyOptionChange('mangle', 'keep_classnames', e.target.checked)
                    }
                  />{' '}
                  keep_classnames
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.keep_fnames}
                    onChange={e =>
                      handleMinifyOptionChange('mangle', 'keep_fnames', e.target.checked)
                    }
                  />{' '}
                  keep_fnames
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.module}
                    onChange={e => handleMinifyOptionChange('mangle', 'module', e.target.checked)}
                  />{' '}
                  module
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.mangle.safari10}
                    onChange={e => handleMinifyOptionChange('mangle', 'safari10', e.target.checked)}
                  />{' '}
                  safari10
                </label>
              </div>
            </div>
            {/* format */}
            <div>
              <div className="font-bold mb-2">format</div>
              <div className="flex flex-col gap-2">
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.format.comments}
                    onChange={e => handleMinifyOptionChange('format', 'comments', e.target.checked)}
                  />{' '}
                  comments
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.format.beautify}
                    onChange={e => handleMinifyOptionChange('format', 'beautify', e.target.checked)}
                  />{' '}
                  beautify
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.format.semicolons === false}
                    onChange={e =>
                      handleMinifyOptionChange(
                        'format',
                        'semicolons',
                        !e.target.checked ? undefined : false
                      )
                    }
                  />{' '}
                  Semicolon
                </label>
              </div>
            </div>
            {/* その他 */}
            <div>
              <div className="font-bold mb-2">その他</div>
              <div className="flex flex-col gap-2">
                <label>
                  ecma
                  <select
                    value={minifyOptions.ecma}
                    onChange={e => handleMinifyOptionChange('root', 'ecma', Number(e.target.value))}
                    className="ml-2 border rounded px-1 py-0.5 text-black bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={2015}>2015</option>
                    <option value={2016}>2016</option>
                    <option value={2017}>2017</option>
                    <option value={2018}>2018</option>
                    <option value={2019}>2019</option>
                    <option value={2020}>2020</option>
                    <option value={2021}>2021</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.toplevel}
                    onChange={e => handleMinifyOptionChange('root', 'toplevel', e.target.checked)}
                  />{' '}
                  toplevel
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.keep_classnames}
                    onChange={e =>
                      handleMinifyOptionChange('root', 'keep_classnames', e.target.checked)
                    }
                  />{' '}
                  keep_classnames
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={minifyOptions.keep_fnames}
                    onChange={e =>
                      handleMinifyOptionChange('root', 'keep_fnames', e.target.checked)
                    }
                  />{' '}
                  keep_fnames
                </label>
              </div>
            </div>
            {/* Resetボタン */}
            <div className="absolute right-0 top-0 mt-2 mr-2">
              <button
                type="button"
                className="px-3 py-1 bg-muted text-muted-foreground border border-border rounded hover:bg-muted/80 transition-colors text-xs font-semibold"
                onClick={() => setMinifyOptions(getDefaultMinifyOptions())}
              >
                リセット
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
