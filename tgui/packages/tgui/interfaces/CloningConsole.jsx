import { round } from 'common/math';
import { Fragment } from 'react';
import { useBackend } from '../backend';
import {
  Box,
  Button,
  Flex,
  Icon,
  LabeledList,
  NoticeBox,
  ProgressBar,
  Section,
  Tabs,
} from '../components';
import { COLORS } from '../constants';
import {
  ComplexModal,
  modalRegisterBodyOverride,
} from '../interfaces/common/ComplexModal';
import { Window } from '../layouts';

const viewRecordModalBodyOverride = (modal) => {
  const { act, data } = useBackend();
  const { activerecord, realname, health, unidentity, strucenzymes } =
    modal.args;
  const damages = health.split(' - ');
  return (
    <Section level={2} m="-1rem" pb="1rem" title={'Records of ' + realname}>
      <LabeledList>
        <LabeledList.Item label="Name">{realname}</LabeledList.Item>
        <LabeledList.Item label="Damage">
          {damages.length > 1 ? (
            <>
              <Box color={COLORS.damageType.oxy} inline>
                {damages[0]}
              </Box>
              &nbsp;|&nbsp;
              <Box color={COLORS.damageType.toxin} inline>
                {damages[2]}
              </Box>
              &nbsp;|&nbsp;
              <Box color={COLORS.damageType.brute} inline>
                {damages[3]}
              </Box>
              &nbsp;|&nbsp;
              <Box color={COLORS.damageType.burn} inline>
                {damages[1]}
              </Box>
            </>
          ) : (
            <Box color="bad">Unknown</Box>
          )}
        </LabeledList.Item>
        <LabeledList.Item label="UI" className="LabeledList__breakContents">
          {unidentity}
        </LabeledList.Item>
        <LabeledList.Item label="SE" className="LabeledList__breakContents">
          {strucenzymes}
        </LabeledList.Item>
        <LabeledList.Item label="Disk">
          <Button.Confirm
            disabled={!data.disk}
            icon="arrow-circle-down"
            content="Import"
            onClick={() =>
              act('disk', {
                option: 'load',
              })
            }
          />
          <Button
            disabled={!data.disk}
            icon="arrow-circle-up"
            content="Export UI"
            onClick={() =>
              act('disk', {
                option: 'save',
                savetype: 'ui',
              })
            }
          />
          <Button
            disabled={!data.disk}
            icon="arrow-circle-up"
            content="Export UI and UE"
            onClick={() =>
              act('disk', {
                option: 'save',
                savetype: 'ue',
              })
            }
          />
          <Button
            disabled={!data.disk}
            icon="arrow-circle-up"
            content="Export SE"
            onClick={() =>
              act('disk', {
                option: 'save',
                savetype: 'se',
              })
            }
          />
        </LabeledList.Item>
        <LabeledList.Item label="Actions">
          <Button
            disabled={!data.podready}
            icon="user-plus"
            content="Clone"
            onClick={() =>
              act('clone', {
                ref: activerecord,
              })
            }
          />
          <Button
            icon="trash"
            content="Delete"
            onClick={() => act('del_rec')}
          />
        </LabeledList.Item>
      </LabeledList>
    </Section>
  );
};

export const CloningConsole = (props) => {
  const { act, data } = useBackend();
  const { menu } = data;
  modalRegisterBodyOverride('view_rec', viewRecordModalBodyOverride);
  return (
    <Window>
      <ComplexModal maxWidth="75%" maxHeight="75%" />
      <Window.Content className="Layout__content--flexColumn">
        <CloningConsoleTemp />
        <CloningConsoleStatus />
        <CloningConsoleNavigation />
        <Section noTopPadding flexGrow="1">
          <CloningConsoleBody />
        </Section>
      </Window.Content>
    </Window>
  );
};

const CloningConsoleNavigation = (props) => {
  const { act, data } = useBackend();
  const { menu } = data;
  return (
    <Tabs>
      <Tabs.Tab
        selected={menu === 1}
        icon="home"
        onClick={() =>
          act('menu', {
            num: 1,
          })
        }
      >
        Main
      </Tabs.Tab>
      <Tabs.Tab
        selected={menu === 2}
        icon="folder"
        onClick={() =>
          act('menu', {
            num: 2,
          })
        }
      >
        Records
      </Tabs.Tab>
    </Tabs>
  );
};

const CloningConsoleBody = (props) => {
  const { data } = useBackend();
  const { menu } = data;
  let body;
  if (menu === 1) {
    body = <CloningConsoleMain />;
  } else if (menu === 2) {
    body = <CloningConsoleRecords />;
  }
  return body;
};

const CloningConsoleMain = (props) => {
  const { act, data } = useBackend();
  const {
    loading,
    scantemp,
    occupant,
    locked,
    can_brainscan,
    scan_mode,
    numberofpods,
    pods,
    selected_pod,
  } = data;
  const isLocked = locked && !!occupant;
  return (
    <>
      <Section
        title="Scanner"
        level="2"
        buttons={
          <>
            <Box inline color="label">
              Scanner Lock:&nbsp;
            </Box>
            <Button
              disabled={!occupant}
              selected={isLocked}
              icon={isLocked ? 'toggle-on' : 'toggle-off'}
              content={isLocked ? 'Engaged' : 'Disengaged'}
              onClick={() => act('lock')}
            />
            <Button
              disabled={isLocked || !occupant}
              icon="user-slash"
              content="Eject Occupant"
              onClick={() => act('eject')}
            />
          </>
        }
      >
        <LabeledList>
          <LabeledList.Item label="Status">
            {loading ? (
              <Box color="average">
                <Icon name="spinner" spin />
                &nbsp; Scanning...
              </Box>
            ) : (
              <Box color={scantemp.color}>{scantemp.text}</Box>
            )}
          </LabeledList.Item>
          {!!can_brainscan && (
            <LabeledList.Item label="Scan Mode">
              <Button
                icon={scan_mode ? 'brain' : 'male'}
                content={scan_mode ? 'Brain' : 'Body'}
                onClick={() => act('toggle_mode')}
              />
            </LabeledList.Item>
          )}
        </LabeledList>
        <Button
          disabled={!occupant || loading}
          icon="user"
          content="Scan Occupant"
          mt="0.5rem"
          mb="0"
          onClick={() => act('scan')}
        />
      </Section>
      <Section title="Pods" level="2">
        {numberofpods ? (
          pods.map((pod, i) => {
            let podAction;
            if (pod.status === 'cloning') {
              podAction = (
                <ProgressBar
                  min="0"
                  max="100"
                  value={pod.progress / 100}
                  ranges={{
                    good: [0.75, Infinity],
                    average: [0.25, 0.75],
                    bad: [-Infinity, 0.25],
                  }}
                  mt="0.5rem"
                >
                  <Box textAlign="center">{round(pod.progress, 0) + '%'}</Box>
                </ProgressBar>
              );
            } else if (pod.status === 'mess') {
              podAction = (
                <Box bold color="bad" mt="0.5rem">
                  ERROR
                </Box>
              );
            } else {
              podAction = (
                <Button
                  selected={selected_pod === pod.pod}
                  icon={selected_pod === pod.pod && 'check'}
                  content="Select"
                  mt="0.5rem"
                  onClick={() =>
                    act('selectpod', {
                      ref: pod.pod,
                    })
                  }
                />
              );
            }

            return (
              <Box
                key={i}
                width="64px"
                textAlign="center"
                display="inline-block"
                mr="0.5rem"
              >
                <img
                  src={'pod_' + pod.status + '.gif'}
                  style={{
                    width: '100%',
                    '-ms-interpolation-mode': 'nearest-neighbor',
                  }}
                />
                <Box color="label">Pod #{i + 1}</Box>
                <Box bold color={pod.biomass >= 150 ? 'good' : 'bad'} inline>
                  <Icon name={pod.biomass >= 150 ? 'circle' : 'circle-o'} />
                  &nbsp;
                  {pod.biomass}
                </Box>
                {podAction}
              </Box>
            );
          })
        ) : (
          <Box color="bad">No pods detected. Unable to clone.</Box>
        )}
      </Section>
    </>
  );
};

const CloningConsoleRecords = (props) => {
  const { act, data } = useBackend();
  const { records } = data;
  if (!records.length) {
    return (
      <Flex height="100%">
        <Flex.Item grow="1" align="center" textAlign="center" color="label">
          <Icon name="user-slash" mb="0.5rem" size="5" />
          <br />
          No records found.
        </Flex.Item>
      </Flex>
    );
  }
  return (
    <Box mt="0.5rem">
      {records.map((record, i) => (
        <Button
          key={i}
          icon="user"
          mb="0.5rem"
          content={record.realname}
          onClick={() =>
            act('view_rec', {
              ref: record.record,
            })
          }
        />
      ))}
    </Box>
  );
};

const CloningConsoleTemp = (props) => {
  const { act, data } = useBackend();
  const { temp } = data;
  if (!temp || !temp.text || temp.text.length <= 0) {
    return;
  }

  const tempProp = { [temp.style]: true };
  return (
    <NoticeBox {...tempProp}>
      <Box display="inline-block" verticalAlign="middle">
        {temp.text}
      </Box>
      <Button
        icon="times-circle"
        float="right"
        onClick={() => act('cleartemp')}
      />
      <Box clear="both" />
    </NoticeBox>
  );
};

const CloningConsoleStatus = (props) => {
  const { act, data } = useBackend();
  const { scanner, numberofpods, autoallowed, autoprocess, disk } = data;
  return (
    <Section
      title="Status"
      buttons={
        <>
          {!!autoallowed && (
            <>
              <Box inline color="label">
                Auto-processing:&nbsp;
              </Box>
              <Button
                selected={autoprocess}
                icon={autoprocess ? 'toggle-on' : 'toggle-off'}
                content={autoprocess ? 'Enabled' : 'Disabled'}
                onClick={() =>
                  act('autoprocess', {
                    on: autoprocess ? 0 : 1,
                  })
                }
              />
            </>
          )}
          <Button
            disabled={!disk}
            icon="eject"
            content="Eject Disk"
            onClick={() =>
              act('disk', {
                option: 'eject',
              })
            }
          />
        </>
      }
    >
      <LabeledList>
        <LabeledList.Item label="Scanner">
          {scanner ? (
            <Box color="good">Connected</Box>
          ) : (
            <Box color="bad">Not connected!</Box>
          )}
        </LabeledList.Item>
        <LabeledList.Item label="Pods">
          {numberofpods ? (
            <Box color="good">{numberofpods} connected</Box>
          ) : (
            <Box color="bad">None connected!</Box>
          )}
        </LabeledList.Item>
      </LabeledList>
    </Section>
  );
};
